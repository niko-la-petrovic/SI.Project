import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      extraProp?: string | null | undefined;
    } & User;
    accessToken?: string | undefined;
  }

  interface User extends DefaultUser {
    backEndId?: string | undefined;
    id: string;
    email: string;
    username?: string | null | undefined;
  }

  interface Account {
    expires_at: number;
  }

  interface Profile {}
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    accessTokenExpires?: number | undefined; // TODO just number
    user?: User | undefined; // TODO just User
  }
}
