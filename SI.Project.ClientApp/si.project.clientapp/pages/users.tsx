import { Card, CardContent } from "@mui/material";
import { useEffect, useState } from "react";

import { AMQPClient } from "@cloudamqp/amqp-client";
import { AMQPWebSocketClient } from "@cloudamqp/amqp-client";
import { back_end } from "../clients/is-rest-client";
import { getIsRestClient } from "../services/is-rest-client";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

export default function Users() {
  const { data: session, status } = useSession();

  const [lastOnlineUsers, setLastOnlineUsers] = useState<back_end.GetUserDto[]>(
    []
  );

  useEffect(() => {
    if (!session?.accessToken) return;

    const client = getIsRestClient(session.accessToken);
    client
      .apiUsers()
      .then((res) => {
        setLastOnlineUsers(res);
      })
      .catch((err) => {
        toast.error("Error while fetching users");
      });
  }, [session?.accessToken]);

  return (
    <>
      <div className="flex flex-col gap-4 p-8">
        <h1>Users</h1>
        <div className="flex flex-col gap-4">
          {lastOnlineUsers.map((user) => (
            <RenderUserCard key={user.id} user={user} />
          ))}
        </div>
      </div>
    </>
  );
}

export const RenderUserCard = ({ user }: { user: back_end.GetUserDto }) => {
  return (
    <Card>
      <CardContent>
        <div className="text-2xl font-bold">{user.userName}</div>
        <div>{user.lastHeartbeat?.toString()}</div>
        <div>{user.isOnline}</div>
      </CardContent>
    </Card>
  );
};
