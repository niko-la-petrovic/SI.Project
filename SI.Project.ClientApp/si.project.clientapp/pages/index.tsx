import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "@mui/material";

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <div className="flex flex-col">
        {session ? (
          <div className="flex flex-col">
            <p>{JSON.stringify(session.user)}</p>
            <p>{JSON.stringify(session.accessToken)}</p>
            <Button variant="contained" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div>
            <Button
              variant="contained"
              onClick={() => signIn("identityServer")}
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
