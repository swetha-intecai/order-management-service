import { Server, ServerCredentials } from "@grpc/grpc-js";

import { loadPackageDefinition } from "@grpc/grpc-js";

import { loadSync } from "@grpc/proto-loader";

import path from "path";
import { fileURLToPath } from "url";

import {
  getInventory,
  checkStock,
  reserveStock,
  releaseStock,
} from "../controllers/inventory.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.join(__dirname, "inventory.proto");

const packageDefinition = loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const inventoryProto = loadPackageDefinition(packageDefinition) as any;

export const startGrpcServer = () => {
  const server = new Server();

  server.addService(inventoryProto.inventory.InventoryService.service, {
    GetInventory: getInventory,
    CheckStock: checkStock,
    ReserveStock: reserveStock,
    ReleaseStock: releaseStock,
  });

  const port = process.env.GRPC_PORT || "50051";

  server.bindAsync(
    `0.0.0.0:${port}`,
    ServerCredentials.createInsecure(),
    (error, actualPort) => {
      if (error) {
        console.error("gRPC server failed:", error);
        return;
      }

      console.log(`Inventory gRPC server running on port ${actualPort}`);
    },
  );

  return server;
};
