import "reflect-metadata";
import "dotenv/config";

import app from "./app.js";
import { AppDataSource } from "./config/database.js";
import { startGrpcServer } from "./grpc/inventory.grpc.js";

const PORT = Number(process.env.PORT || 50052);

const startServer = async () => {
  try {
    await AppDataSource.initialize();

    console.log("PostgreSQL connected successfully");

    app.listen(PORT, () => {
      console.log(`HTTP server running on port ${PORT}`);
    });

    startGrpcServer();
  } catch (error) {
    console.error("Failed to start Inventory Service:", error);

    process.exit(1);
  }
};

startServer();
