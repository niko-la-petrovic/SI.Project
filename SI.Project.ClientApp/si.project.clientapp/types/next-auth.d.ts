import { DefaultSession, DefaultUser } from "next-auth";
import { AuthErrorType } from "./auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      extraProp?: string | null | undefined;
    } & User;
    accessToken?: string | undefined;
    idToken?: string | undefined;
    error?: AuthErrorType | undefined;
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name?: string | null | undefined;
  }

  interface Account {
    expires_at: number;
  }

  interface Profile {}
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string | undefined;
    idToken?: string | undefined;
    refreshToken?: string | undefined;
    accessTokenExpires?: number | undefined; // TODO just number
    user?: User | undefined; // TODO just User
    error?: AuthErrorType | undefined;
  }
}
