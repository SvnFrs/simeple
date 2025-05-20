import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "";
const dbName = process.env.DB_NAME || "simeple";

const client = new MongoClient(uri);

export const connectDB = async (): Promise<Db> => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName);
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

export const getDB = (): Db => {
  return client.db(dbName);
};

export const closeDB = async (): Promise<void> => {
  await client.close();
  console.log("MongoDB connection closed");
};
