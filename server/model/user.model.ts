import { Collection, ObjectId } from "mongodb";
import { getDB } from "../config/db.config";
import bcrypt from "bcrypt";
import type { User, UserWithPassword } from "../types/user.types";

export class UserModel {
  private collection: Collection<User>;

  constructor() {
    this.collection = getDB().collection<UserWithPassword>("users");
  }

  async getAll(): Promise<User[]> {
    return await this.collection.find({}, { projection: { password: 0 } }).toArray();
  }

  async getByID(id: string): Promise<User | null> {
    return await this.collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );
  }

  async getByName(name: string): Promise<User | null> {
    return this.collection.findOne(
      { name: { $regex: new RegExp(name, "i") } },
      { projection: { password: 0 } }
    );
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.collection.findOne({ email: email });
  }

  async getByUsername(name: string): Promise<User | null> {
    return this.collection.findOne(
      { username: { $regex: new RegExp(name, "i") } },
      { projection: { password: 0 } }
    );
  }

  async create(user: UserWithPassword): Promise<User> {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }


    const result = await this.collection.insertOne(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, _id: result.insertedId };
  }

  async update(id: string, user: Partial<UserWithPassword>): Promise<boolean> {
    // If updating password, hash it
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: user }
    );
    return result.modifiedCount > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async validatePassword(email: string, password: string): Promise<UserWithPassword | null> {
    const user = await this.collection.findOne({ email }) as UserWithPassword;
    if (!user || !user.password) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }
}
