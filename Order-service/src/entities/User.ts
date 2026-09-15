import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from "typeorm";

import { Order } from "./Order.js";

@Entity("users")
export class User {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar",
    length: 255
  })
  name!: string;

  @Column({
    type: "varchar",
    length: 255,
    unique: true
  })
  email!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(
    () => Order,
    (order) => order.user
  )
  orders!: Order[];
}