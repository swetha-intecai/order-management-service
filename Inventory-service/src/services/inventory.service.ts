import { AppDataSource } from "../config/database.js";
import { Inventory } from "../entities/Inventory.js";

export class InventoryService {
  private inventoryRepository = AppDataSource.getRepository(Inventory);

  async getInventory(productId: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        productId,
      },
    });

    if (!inventory) {
      throw new Error(`Inventory not found for product ${productId}`);
    }

    return inventory;
  }

  async checkStock(productId: number, quantity: number) {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const inventory = await this.getInventory(productId);

    return {
      available: inventory.quantity >= quantity,
      availableQuantity: inventory.quantity,
    };
  }

  async reserveStock(productId: number, quantity: number) {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const inventory = await queryRunner.manager
        .getRepository(Inventory)
        .createQueryBuilder("inventory")
        .setLock("pessimistic_write")
        .where("inventory.productId = :productId", { productId })
        .getOne();

      if (!inventory) {
        throw new Error(`Inventory not found for product ${productId}`);
      }

      if (inventory.quantity < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${inventory.quantity}, requested: ${quantity}`,
        );
      }

      inventory.quantity -= quantity;

      await queryRunner.manager.save(inventory);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: "Stock reserved successfully",
        remainingQuantity: inventory.quantity,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async releaseStock(productId: number, quantity: number) {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const inventory = await queryRunner.manager
        .getRepository(Inventory)
        .createQueryBuilder("inventory")
        .setLock("pessimistic_write")
        .where("inventory.productId = :productId", { productId })
        .getOne();

      if (!inventory) {
        throw new Error(`Inventory not found for product ${productId}`);
      }

      inventory.quantity += quantity;

      await queryRunner.manager.save(inventory);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: "Stock released successfully",
        quantity: inventory.quantity,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
