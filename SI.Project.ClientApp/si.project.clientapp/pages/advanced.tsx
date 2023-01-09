import { Button } from "@mui/material";
import { useSession } from "next-auth/react";

export default function Advanced() {
  const { data: session } = useSession();

  return (
    <div>
      <div className="flex flex-col gap-8 w-64">
        <p>{JSON.stringify(session?.user)}</p>
        <Button
          variant="contained"
          onClick={() => {
            navigator.clipboard.writeText(session?.accessToken ?? "");
          }}
        >
          Access Token
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            navigator.clipboard.writeText(session?.idToken ?? "");
          }}
        >
          ID Token
        </Button>
      </div>
    </div>
  );
}
