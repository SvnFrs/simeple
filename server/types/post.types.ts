import type { ObjectId } from "mongodb";

export interface Post {
  _id?: ObjectId;
  userID: string;
  userName: string;
  userImage?: string;
  content: {
    text: string;
    image?: string;
  }
  likes: {
    count: number;
    users: string[];
  }
  comments: {
    count: number;
    content: [
      {
        userID: string;
        userName: string;
        userImage?: string;
        text: string;
        date: Date;
      }
    ]
  }
}
