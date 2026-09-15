import {
  credentials,
  loadPackageDefinition
} from "@grpc/grpc-js";

import {
  loadSync
} from "@grpc/proto-loader";

import path from "path";
import { fileURLToPath } from "url";


// ========================================
// PATH
// ========================================

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const protoPath = path.join(
  __dirname,
  "inventory.proto"
);


// ========================================
// LOAD PROTO
// ========================================

const packageDefinition = loadSync(
  protoPath,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);


const inventoryProto =
  loadPackageDefinition(
    packageDefinition
  ) as any;


// ========================================
// CREATE CLIENT
// ========================================

const inventoryClient =
  new inventoryProto.inventory.InventoryService(
    `${process.env.INVENTORY_GRPC_HOST}:${process.env.INVENTORY_GRPC_PORT}`,
    credentials.createInsecure()
  );


// ========================================
// GET INVENTORY
// ========================================

export const getInventory =
  (
    productId: number
  ): Promise<any> => {

    return new Promise(
      (resolve, reject) => {

        inventoryClient.GetInventory(
          {
            productId
          },

          (
            error: any,
            response: any
          ) => {

            if (error) {
              reject(error);
              return;
            }

            resolve(response);
          }
        );
      }
    );
  };


// ========================================
// CHECK STOCK
// ========================================

export const checkStock =
  (
    productId: number,
    quantity: number
  ): Promise<any> => {

    return new Promise(
      (resolve, reject) => {

        inventoryClient.CheckStock(
          {
            productId,
            quantity
          },

          (
            error: any,
            response: any
          ) => {

            if (error) {
              reject(error);
              return;
            }

            resolve(response);
          }
        );
      }
    );
  };


// ========================================
// RESERVE STOCK
// ========================================

export const reserveStock =
  (
    productId: number,
    quantity: number
  ): Promise<any> => {

    return new Promise(
      (resolve, reject) => {

        inventoryClient.ReserveStock(
          {
            productId,
            quantity
          },

          (
            error: any,
            response: any
          ) => {

            if (error) {
              reject(error);
              return;
            }

            resolve(response);
          }
        );
      }
    );
  };


// ========================================
// RELEASE STOCK
// ========================================

export const releaseStock =
  (
    productId: number,
    quantity: number
  ): Promise<any> => {

    return new Promise(
      (resolve, reject) => {

        inventoryClient.ReleaseStock(
          {
            productId,
            quantity
          },

          (
            error: any,
            response: any
          ) => {

            if (error) {
              reject(error);
              return;
            }

            resolve(response);
          }
        );
      }
    );
  };