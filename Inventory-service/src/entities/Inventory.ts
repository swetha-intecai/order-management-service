import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";

import { Product } from "./Product.js";

@Entity("inventory")
export class Inventory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "integer",
  })
  productId!: number;

  @Column({
    type: "integer",
  })
  quantity!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Product, (product) => product.inventory)
  @JoinColumn({
    name: "productId",
  })
  product!: Product;
}
