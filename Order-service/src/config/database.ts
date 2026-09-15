import "reflect-metadata";
import "dotenv/config";

import { DataSource } from "typeorm";

import { User } from "../entities/User.js";
import { Order } from "../entities/Order.js";
import { OrderItem } from "../entities/OrderItem.js";

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

if (!DB_HOST || !DB_PORT || !DB_USERNAME || !DB_PASSWORD || !DB_NAME) {
  throw new Error("Missing required database environment variables");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,

  entities: [
    User,
    Order,
    OrderItem
  ],

  synchronize: true,

  logging: false
});