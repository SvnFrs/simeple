import type { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  username: string;
  userImage?: string;
  name: string;
  email: string;
}

export interface UserWithPassword extends User {
  password?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginCredentials {
  name: string;
  username: string;
}
