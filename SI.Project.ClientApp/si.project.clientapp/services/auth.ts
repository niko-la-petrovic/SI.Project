import { signIn, useSession } from "next-auth/react";

export const signOutUrl = "/auth/begin-signout";

export function signInUtil() {
  signIn("identityServer");
}

export const getIsIssuer = () => process.env.IS_ISSUER || "";
export const getClientId = () => process.env.IS_CLIENT_ID || "";
export const getClientSecret = () => process.env.IS_CLIENT_SECRET || "";
export const getScopes = () => process.env.IS_SCOPES || "";
export const getIsApiUrl = () => process.env.NEXT_PUBLIC_IS_API || "";
