import {
  credentials,
  loadPackageDefinition
} from "@grpc/grpc-js";

import {
  loadSync
} from "@grpc/proto-loader";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.join(
  __dirname,
  "inventory.proto"
);

const packageDefinition = loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const inventoryProto =
  loadPackageDefinition(packageDefinition) as any;

const client =
  new inventoryProto.inventory.InventoryService(
    "localhost:50051",
    credentials.createInsecure()
  );


// ========================================
// 1. CHECK STOCK
// ========================================

client.CheckStock(
  {
    productId: 1,
    quantity: 3
  },
  (error: any, response: any) => {

    if (error) {
      console.error(
        "CheckStock Error:",
        error.message
      );
      return;
    }

    console.log("\n===== CHECK STOCK =====");

    console.log(response);
  }
);


// ========================================
// 2. RESERVE STOCK
// ========================================

client.ReserveStock(
  {
    productId: 1,
    quantity: 2
  },
  (error: any, response: any) => {

    if (error) {
      console.error(
        "ReserveStock Error:",
        error.message
      );
      return;
    }

    console.log("\n===== RESERVE STOCK =====");

    console.log(response);
  }
);


// ========================================
// 3. RELEASE STOCK
// ========================================

client.ReleaseStock(
  {
    productId: 1,
    quantity: 1
  },
  (error: any, response: any) => {

    if (error) {
      console.error(
        "ReleaseStock Error:",
        error.message
      );
      return;
    }

    console.log("\n===== RELEASE STOCK =====");

    console.log(response);
  }
);