import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";

export class UserService {

  private userRepository =
    AppDataSource.getRepository(User);


  // ==========================================
  // GET USER BY ID
  // ==========================================

  async getUserById(
    userId: number
  ): Promise<User | null> {

    const user =
      await this.userRepository.findOne({
        where: {
          id: userId
        }
      });

    return user;
  }


  // ==========================================
  // VALIDATE USER
  // ==========================================

  async validateUser(
    userId: number
  ): Promise<User> {

    if (!Number.isInteger(userId)) {
      throw new Error(
        "Invalid user ID"
      );
    }

    const user =
      await this.getUserById(userId);

    if (!user) {
      throw new Error(
        `User ${userId} not found`
      );
    }

    return user;
  }


  // ==========================================
  // CREATE USER
  // ==========================================

  async createUser(
    name: string,
    email: string
  ): Promise<User> {

    if (!name || !name.trim()) {
      throw new Error(
        "Name is required"
      );
    }

    if (!email || !email.trim()) {
      throw new Error(
        "Email is required"
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();


    const existingUser =
      await this.userRepository.findOne({
        where: {
          email: normalizedEmail
        }
      });


    if (existingUser) {
      throw new Error(
        `User with email ${normalizedEmail} already exists`
      );
    }


    const user =
      this.userRepository.create({
        name: name.trim(),
        email: normalizedEmail
      });


    return await this.userRepository.save(
      user
    );
  }
}