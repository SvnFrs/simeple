import { Collection, ObjectId } from "mongodb";
import { getDB } from "../config/db.config";
import type { Post } from "../types/post.types";

export class PostModel {
  private collection: Collection<Post>;

  constructor() {
    this.collection = getDB().collection<Post>("posts");
  }

  async getAll(): Promise<Post[]> {
    return await this.collection.find().toArray();
  }

  async getByID(id: string): Promise<Post | null> {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async create(post: Post): Promise<Post> {
    const result = await this.collection.insertOne(post);
    return { ...post, _id: result.insertedId };
  }

  async update(id: string, post: Post): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: post }
    );
    return result.modifiedCount > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}
