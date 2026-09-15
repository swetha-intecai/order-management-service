import {
  DataSource,
  Repository
} from "typeorm";

import { AppDataSource } from "../config/database.js";

import {
  Order,
  OrderStatus
} from "../entities/Order.js";

import { OrderItem } from "../entities/OrderItem.js";

import { UserService } from "./user.service.js";

import {
  getInventory,
  checkStock,
  reserveStock,
  releaseStock
} from "../grpc/inventory.client.js";


// ==========================================
// TYPES
// ==========================================

export interface CreateOrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderInput {
  userId: number;
  items: CreateOrderItemInput[];
}

export interface GetUserOrdersResult {
  orders: Order[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}


// ==========================================
// ORDER SERVICE
// ==========================================

export class OrderService {

  private dataSource: DataSource;

  private orderRepository: Repository<Order>;

  private orderItemRepository: Repository<OrderItem>;

  private userService: UserService;


  constructor() {

    this.dataSource =
      AppDataSource;

    this.orderRepository =
      this.dataSource.getRepository(Order);

    this.orderItemRepository =
      this.dataSource.getRepository(OrderItem);

    this.userService =
      new UserService();
  }


  // ==========================================
  // CREATE ORDER
  // ==========================================

  async createOrder(
    input: CreateOrderInput
  ): Promise<Order> {

    // ----------------------------------------
    // 1. Validate input
    // ----------------------------------------

    if (!input) {
      throw new Error(
        "Order input is required"
      );
    }


    const userId =
      Number(input.userId);


    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      throw new Error(
        "Invalid user ID"
      );
    }


    if (
      !Array.isArray(input.items) ||
      input.items.length === 0
    ) {
      throw new Error(
        "Order must contain at least one item"
      );
    }


    // ----------------------------------------
    // 2. Validate user
    // ----------------------------------------

    await this.userService.validateUser(
      userId
    );


    // ----------------------------------------
    // 3. Validate order items
    // ----------------------------------------

    const items =
      this.validateOrderItems(
        input.items
      );


    // ----------------------------------------
    // 4. Combine duplicate products
    // ----------------------------------------

    const normalizedItems =
      this.combineDuplicateProducts(
        items
      );


    // ----------------------------------------
    // 5. Validate products through Inventory
    // ----------------------------------------

    for (const item of normalizedItems) {

      try {

        const inventory =
          await getInventory(
            item.productId
          );


        if (!inventory) {
          throw new Error(
            `Product ${item.productId} not found`
          );
        }

      } catch (error: any) {

        throw new Error(
          `Unable to validate product ${item.productId}: ${error.message}`
        );
      }
    }


    // ----------------------------------------
    // 6. Check stock
    // ----------------------------------------

    for (const item of normalizedItems) {

      try {

        const stock =
          await checkStock(
            item.productId,
            item.quantity
          );


        if (!stock?.available) {

          throw new Error(
            `Insufficient stock for product ${item.productId}. Available: ${stock?.availableQuantity ?? 0}, requested: ${item.quantity}`
          );
        }

      } catch (error: any) {

        throw new Error(
          `Stock check failed for product ${item.productId}: ${error.message}`
        );
      }
    }


    // ----------------------------------------
    // 7. Reserve stock
    // ----------------------------------------

    const reservedItems:
      CreateOrderItemInput[] = [];


    try {

      // --------------------------------------
      // Reserve each item
      // --------------------------------------

      for (const item of normalizedItems) {

        const result =
          await reserveStock(
            item.productId,
            item.quantity
          );


        if (!result?.success) {

          throw new Error(
            result?.message ||
            `Unable to reserve stock for product ${item.productId}`
          );
        }


        // Only add the item after the
        // reservation was successful.
        reservedItems.push({
          productId: item.productId,
          quantity: item.quantity
        });
      }


      // --------------------------------------
      // 8. Create database transaction
      // --------------------------------------

      const queryRunner =
        this.dataSource.createQueryRunner();


      await queryRunner.connect();

      await queryRunner.startTransaction();


      try {

        // ------------------------------------
        // Create Order
        // ------------------------------------

        const order =
          queryRunner.manager.create(
            Order,
            {
              userId,
              status:
                OrderStatus.PENDING
            }
          );


        const savedOrder =
          await queryRunner.manager.save(
            Order,
            order
          );


        // ------------------------------------
        // Create Order Items
        // ------------------------------------

        const orderItems =
          normalizedItems.map(
            (item) => {

              return queryRunner.manager.create(
                OrderItem,
                {
                  orderId:
                    savedOrder.id,

                  productId:
                    item.productId,

                  quantity:
                    item.quantity,

                  // Price is temporarily 0 because
                  // the current Inventory gRPC
                  // contract does not return price.
                  price: 0
                }
              );
            }
          );


        await queryRunner.manager.save(
          OrderItem,
          orderItems
        );


        // ------------------------------------
        // Commit transaction
        // ------------------------------------

        await queryRunner.commitTransaction();


        // ------------------------------------
        // Release query runner
        // ------------------------------------

        await queryRunner.release();


        // ------------------------------------
        // Return complete order
        // ------------------------------------

        const completeOrder =
          await this.getOrder(
            savedOrder.id
          );


        if (!completeOrder) {

          throw new Error(
            "Order was created but could not be retrieved"
          );
        }


        return completeOrder;

      } catch (databaseError) {

        // ------------------------------------
        // Rollback database transaction
        // ------------------------------------

        await queryRunner.rollbackTransaction();

        await queryRunner.release();


        // ------------------------------------
        // Release reserved stock
        // ------------------------------------

        await this.releaseReservedItems(
          reservedItems
        );


        // Clear the array so the outer catch
        // does not release the same stock again.
        reservedItems.length = 0;


        throw databaseError;
      }

    } catch (error) {

      // --------------------------------------
      // Reservation itself failed
      // --------------------------------------

      if (
        reservedItems.length > 0
      ) {

        await this.releaseReservedItems(
          reservedItems
        );
      }


      throw error;
    }
  }


  // ==========================================
  // VALIDATE ORDER ITEMS
  // ==========================================

  private validateOrderItems(
    items: CreateOrderItemInput[]
  ): CreateOrderItemInput[] {

    return items.map(
      (item) => {

        const productId =
          Number(item.productId);

        const quantity =
          Number(item.quantity);


        if (
          !Number.isInteger(productId) ||
          productId <= 0
        ) {

          throw new Error(
            "Invalid product ID"
          );
        }


        if (
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {

          throw new Error(
            `Invalid quantity for product ${productId}`
          );
        }


        return {
          productId,
          quantity
        };
      }
    );
  }


  // ==========================================
  // COMBINE DUPLICATE PRODUCTS
  // ==========================================

  private combineDuplicateProducts(
    items: CreateOrderItemInput[]
  ): CreateOrderItemInput[] {

    const productMap =
      new Map<number, number>();


    for (const item of items) {

      const current =
        productMap.get(
          item.productId
        ) || 0;


      productMap.set(
        item.productId,
        current + item.quantity
      );
    }


    return Array.from(
      productMap.entries()
    ).map(
      ([productId, quantity]) => ({
        productId,
        quantity
      })
    );
  }


  // ==========================================
  // RELEASE RESERVED ITEMS
  // ==========================================

  private async releaseReservedItems(
    items: CreateOrderItemInput[]
  ): Promise<void> {

    for (const item of items) {

      try {

        await releaseStock(
          item.productId,
          item.quantity
        );


        console.log(
          `Released ${item.quantity} unit(s) of product ${item.productId}`
        );

      } catch (error: any) {

        console.error(
          `CRITICAL: Failed to release stock for product ${item.productId}:`,
          error.message
        );
      }
    }
  }


  // ==========================================
  // GET ORDER
  // ==========================================

  async getOrder(
    orderId: number
  ): Promise<Order | null> {

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {

      throw new Error(
        "Invalid order ID"
      );
    }


    const order =
      await this.orderRepository.findOne({

        where: {
          id: orderId
        },

        relations: {
          items: true
        }
      });


    return order;
  }


  // ==========================================
  // GET USER ORDERS
  // ==========================================

  async getUserOrders(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<GetUserOrdersResult> {

    // ----------------------------------------
    // 1. Validate user
    // ----------------------------------------

    await this.userService.validateUser(
      userId
    );


    // ----------------------------------------
    // 2. Validate pagination
    // ----------------------------------------

    page =
      Number(page);

    limit =
      Number(limit);


    if (
      !Number.isInteger(page) ||
      page < 1
    ) {

      page = 1;
    }


    if (
      !Number.isInteger(limit) ||
      limit < 1
    ) {

      limit = 10;
    }


    // Maximum 100 orders per request.
    if (limit > 100) {
      limit = 100;
    }


    const skip =
      (page - 1) * limit;


    // ----------------------------------------
    // 3. Get orders
    // ----------------------------------------

    const [
      orders,
      total
    ] =
      await this.orderRepository.findAndCount({

        where: {
          userId
        },

        relations: {
          items: true
        },

        order: {
          createdAt: "DESC"
        },

        skip,

        take: limit
      });


    // ----------------------------------------
    // 4. Check next page
    // ----------------------------------------

    const hasNextPage =
      skip + orders.length < total;


    return {
      orders,
      page,
      limit,
      total,
      hasNextPage
    };
  }


  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================

  async updateOrderStatus(
    orderId: number,
    status: OrderStatus
  ): Promise<Order> {

    // ----------------------------------------
    // 1. Get order
    // ----------------------------------------

    const order =
      await this.getOrder(
        orderId
      );


    if (!order) {

      throw new Error(
        `Order ${orderId} not found`
      );
    }


    // ----------------------------------------
    // 2. Validate status
    // ----------------------------------------

    if (
      !Object.values(
        OrderStatus
      ).includes(status)
    ) {

      throw new Error(
        `Invalid order status: ${status}`
      );
    }


    // ----------------------------------------
    // 3. Prevent cancelled order update
    // ----------------------------------------

    if (
      order.status ===
      OrderStatus.CANCELLED
    ) {

      throw new Error(
        "Cancelled order cannot be updated"
      );
    }


    // ----------------------------------------
    // 4. Update status
    // ----------------------------------------

    order.status =
      status;


    await this.orderRepository.save(
      order
    );


    return (
      await this.getOrder(
        order.id
      )
    )!;
  }


  // ==========================================
  // CANCEL ORDER
  // ==========================================

  async cancelOrder(
    orderId: number
  ): Promise<Order> {

    // ----------------------------------------
    // 1. Get order
    // ----------------------------------------

    const order =
      await this.getOrder(
        orderId
      );


    if (!order) {

      throw new Error(
        `Order ${orderId} not found`
      );
    }


    // ----------------------------------------
    // 2. Already cancelled
    // ----------------------------------------

    if (
      order.status ===
      OrderStatus.CANCELLED
    ) {

      throw new Error(
        `Order ${orderId} is already cancelled`
      );
    }


    // ----------------------------------------
    // 3. Cannot cancel confirmed order
    // ----------------------------------------

    if (
      order.status ===
      OrderStatus.CONFIRMED
    ) {

      throw new Error(
        "Confirmed order cannot be cancelled"
      );
    }


    // ----------------------------------------
    // 4. Release stock
    // ----------------------------------------

    for (const item of order.items) {

      try {

        await releaseStock(
          item.productId,
          item.quantity
        );

      } catch (error: any) {

        throw new Error(
          `Failed to release stock for product ${item.productId}: ${error.message}`
        );
      }
    }


    // ----------------------------------------
    // 5. Update order status
    // ----------------------------------------

    order.status =
      OrderStatus.CANCELLED;


    await this.orderRepository.save(
      order
    );


    // ----------------------------------------
    // 6. Return updated order
    // ----------------------------------------

    return (
      await this.getOrder(
        order.id
      )
    )!;
  }
}