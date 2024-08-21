// File: types/next-auth.d.ts
import { DefaultSession } from "next-auth"
import { IUser } from "@/models/User"

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
  declare module "next-auth/jwt" {
    interface JWT {
      id: string;
      accessToken?: string;
    }
  }

  interface User extends Omit<IUser, 'password'> {
    id: string;
    accessToken: string;
  }
}