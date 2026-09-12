import { status } from "@grpc/grpc-js";
import type { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { InventoryService } from "../services/inventory.service.js";

const inventoryService = new InventoryService();

export const getInventory = async (
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
) => {
  try {
    const { productId } = call.request;

    const inventory = await inventoryService.getInventory(productId);

    callback(null, {
      productId: inventory.productId,
      quantity: inventory.quantity,
    });
  } catch (error) {
    callback({
      code: status.NOT_FOUND,
      message: error instanceof Error ? error.message : "Inventory not found",
    });
  }
};

export const checkStock = async (
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
) => {
  try {
    const { productId, quantity } = call.request;

    const result = await inventoryService.checkStock(productId, quantity);

    callback(null, result);
  } catch (error) {
    callback({
      code: status.INVALID_ARGUMENT,
      message: error instanceof Error ? error.message : "Invalid stock request",
    });
  }
};

export const reserveStock = async (
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
) => {
  try {
    const { productId, quantity } = call.request;

    const result = await inventoryService.reserveStock(productId, quantity);

    callback(null, result);
  } catch (error) {
    callback({
      code: status.FAILED_PRECONDITION,
      message:
        error instanceof Error ? error.message : "Unable to reserve stock",
    });
  }
};

export const releaseStock = async (
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
) => {
  try {
    const { productId, quantity } = call.request;

    const result = await inventoryService.releaseStock(productId, quantity);

    callback(null, result);
  } catch (error) {
    callback({
      code: status.INTERNAL,
      message:
        error instanceof Error ? error.message : "Unable to release stock",
    });
  }
};
