import {
  getClientId,
  getClientSecret,
  getIsIssuer,
  getScopes,
} from "../../../services/auth";

import { AuthErrorType } from "../../../types/auth";
import { Console } from "console";
import IdentityServerProvider from "next-auth/providers/identity-server4";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth/next";

async function refreshAccessToken(token: JWT) {
  try {
    const refreshUrl = `${process.env.IS_ISSUER}/connect/token`;

    const body = new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      grant_type: "refresh_token",
      refresh_token: token.refreshToken ?? "", // TODO handle if null
    });

    refreshUrl;

    const response = await fetch(refreshUrl, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: body,
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error(error);

    return {
      ...token,
      error: AuthErrorType.EXPIRED_REFRESH_TOKEN,
      // TODO error handling
    };
  }
}

export default NextAuth({
  providers: [
    IdentityServerProvider({
      id: "identityServer",
      name: "Identity-Server",
      issuer: getIsIssuer(),
      authorization: { params: { scope: getScopes() } },
      clientId: getClientId(),
      clientSecret: getClientSecret(),
      // TODO userinfo
      // userinfo: {
      //   url: `${process.env.IS_ISSUER}/connect/userinfo`,
      // },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      if (account && user) {
        return {
          idToken: account.id_token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }

      if (!token.accessTokenExpires || Date.now() >= token.accessTokenExpires) {
        return refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token: tokens, user }) {
      session.user = tokens.user;
      session.accessToken = tokens.accessToken;
      session.error = tokens.error;
      session.idToken = tokens.idToken;

      return session;
      // TODO
      // return sessionWithMappedClaims(session);
    },
  },
});

// TODO function to force refresh of access token for new claims

// function sessionWithMappedClaims(session) {
//   const userId = session.user.id;
//   const idTokenPayload = decodeIdToken(session.idToken);
//   if (!idTokenPayload) return session;

//   const sessionWithRoleClaims = addClaimsToUser(
//     idTokenPayload,
//     session,
//     userId,
//     "role",
//     "roles"
//   );
//   const sessionWithStudyYearAdminClaims = addClaimsToUser(
//     idTokenPayload,
//     sessionWithRoleClaims,
//     userId,
//     "year-admin",
//     "studyYearAdmin"
//   );
//   const sessionWithCourseAdminClaims = addClaimsToUser(
//     idTokenPayload,
//     sessionWithStudyYearAdminClaims,
//     userId,
//     "course-admin",
//     "courseAdmin"
//   );

//   return sessionWithCourseAdminClaims;
// }

// function decodeIdToken(idToken, userId) {
//   let idTokenPayload = null;
//   try {
//     try {
//       idTokenPayload = JSON.parse(
//         Buffer.from(idToken.split(".")[1], "base64").toString()
//       );
//     } catch (error) {
//       console.error("Failed to decode ID token for user", userId, error);
//       throw error;
//     }
//   } finally {
//     return idTokenPayload;
//   }
// }

// function addClaimsToUser(idTokenPayload, session, userId, idTokenKey, userKey) {
//   try {
//     const userClaim = idTokenPayload[idTokenKey];
//     if (!userClaim) return session;
//     if (userClaim instanceof Array) {
//       session.user[userKey] = userClaim;
//     } else if (typeof userClaim === "string") {
//       session.user[userKey] = [userClaim];
//     } else {
//       console.error(
//         `Invalid "${idTokenKey}" claim for user`,
//         userId,
//         userClaim
//       );
//       throw new Error(`Invalid "${idTokenKey}" claim`);
//     }
//   } catch (error) {
//     console.error(
//       `Failed to set "${idTokenKey}" claims for user`,
//       userId,
//       error
//     );
//     throw error;
//   } finally {
//     return session;
//   }
// }
