import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from "typeorm";

import { User } from "./User.js";
import { OrderItem } from "./OrderItem.js";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED"
}

@Entity("orders")
export class Order {

  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({
    type: "integer"
  })
  userId!: number;

  @Column({
    type: "varchar",
    length: 20,
    default: OrderStatus.PENDING
  })
  status!: OrderStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(
    () => User,
    (user) => user.orders,
    {
      onDelete: "RESTRICT"
    }
  )
  @JoinColumn({
    name: "userId"
  })
  user!: User;

  @OneToMany(
    () => OrderItem,
    (item) => item.order,
    {
      cascade: true
    }
  )
  items!: OrderItem[];
}