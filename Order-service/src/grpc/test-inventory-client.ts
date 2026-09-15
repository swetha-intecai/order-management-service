import "dotenv/config";

import {
  getInventory,
  checkStock,
  reserveStock,
  releaseStock
} from "./inventory.client.js";


const test = async () => {

  try {

    // ========================================
    // 1. GET INVENTORY
    // ========================================

    console.log("\n==============================");
    console.log("1. GET INVENTORY");
    console.log("==============================");

    const inventory =
      await getInventory(1);

    console.log(inventory);


    // ========================================
    // 2. CHECK STOCK
    // ========================================

    console.log("\n==============================");
    console.log("2. CHECK STOCK");
    console.log("==============================");

    const stock =
      await checkStock(1, 2);

    console.log(stock);


    // ========================================
    // 3. RESERVE STOCK
    // ========================================

    console.log("\n==============================");
    console.log("3. RESERVE STOCK");
    console.log("==============================");

    const reserved =
      await reserveStock(1, 1);

    console.log(reserved);


    // ========================================
    // 4. RELEASE STOCK
    // ========================================

    console.log("\n==============================");
    console.log("4. RELEASE STOCK");
    console.log("==============================");

    const released =
      await releaseStock(1, 1);

    console.log(released);


  } catch (error: any) {

    console.error(
      "\nInventory gRPC Error:"
    );

    console.error(
      error.message
    );
  }
};


test();