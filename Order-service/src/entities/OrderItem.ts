import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from "typeorm";

import { Order } from "./Order.js";

@Entity("order_items")
export class OrderItem {

  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({
    type: "integer"
  })
  orderId!: number;

  @Column({
    type: "integer"
  })
  productId!: number;

  @Column({
    type: "integer"
  })
  quantity!: number;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2
  })
  price!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(
    () => Order,
    (order) => order.items,
    {
      onDelete: "CASCADE"
    }
  )
  @JoinColumn({
    name: "orderId"
  })
  order!: Order;
}