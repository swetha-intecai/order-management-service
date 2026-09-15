import {
  OrderStatus
} from "../entities/Order.js";

import {
  OrderService
} from "../services/order.service.js";


const orderService =
  new OrderService();


export const resolvers = {

  // ========================================
  // QUERY
  // ========================================

  Query: {

    getOrder: async (
      _parent: unknown,
      args: {
        id: string;
      }
    ) => {

      return await orderService.getOrder(
        Number(args.id)
      );
    },


    getUserOrders: async (
      _parent: unknown,
      args: {
        userId: string;
        page?: number;
        limit?: number;
      }
    ) => {

      return await orderService.getUserOrders(
        Number(args.userId),
        args.page ?? 1,
        args.limit ?? 10
      );
    }
  },


  // ========================================
  // MUTATION
  // ========================================

  Mutation: {

    createOrder: async (
      _parent: unknown,
      args: {
        input: {
          userId: string;
          items: {
            productId: string;
            quantity: number;
          }[];
        };
      }
    ) => {

      return await orderService.createOrder({

        userId:
          Number(args.input.userId),

        items:
          args.input.items.map(
            (item) => ({
              productId:
                Number(item.productId),

              quantity:
                Number(item.quantity)
            })
          )
      });
    },


    cancelOrder: async (
      _parent: unknown,
      args: {
        id: string;
      }
    ) => {

      return await orderService.cancelOrder(
        Number(args.id)
      );
    },


    updateOrderStatus: async (
      _parent: unknown,
      args: {
        id: string;
        status: OrderStatus;
      }
    ) => {

      return await orderService.updateOrderStatus(
        Number(args.id),
        args.status
      );
    }
  }
};