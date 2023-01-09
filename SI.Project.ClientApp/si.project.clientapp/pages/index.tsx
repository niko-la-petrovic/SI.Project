import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "@mui/material";

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <div className="flex flex-col"></div>
    </>
  );
}
