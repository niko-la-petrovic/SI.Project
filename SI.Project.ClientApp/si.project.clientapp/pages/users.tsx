import { Button, Card, CardContent, TextField } from "@mui/material";
import {
  SignalRContext,
  SignalRHandlers,
} from "../components/templates/layout";
import { useContext, useEffect, useState } from "react";

import { AMQPClient } from "@cloudamqp/amqp-client";
import { AMQPWebSocketClient } from "@cloudamqp/amqp-client";
import { CertStoreContext } from "../store/cert-store";
import { HubConnectionState } from "@microsoft/signalr";
import { PostUserPublicKeyRequestDto } from "../types/dtos";
import { back_end } from "../clients/is-rest-client";
import { getIsRestClient } from "../services/is-rest-client";
import { reqPubKeyToastId } from "../services/toastIds";
import { toast } from "react-toastify";
import { useDebounce } from "usehooks-ts";
import { useSession } from "next-auth/react";

export default function Users() {
  const { data: session, status } = useSession();

  const [lastOnlineUsers, setLastOnlineUsers] = useState<back_end.GetUserDto[]>(
    []
  );
  const [searchUserQuery, setSearchUserQuery] = useState<string>("");
  const searchUserQueryDebounced = useDebounce(searchUserQuery, 500);
  
  const { connection } = useContext(SignalRContext);

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

    // TODO konfigurisati ufw firewall
    // TODO config wss - reverse proxy na vm
    // TODO extract to .env
    const user = "clientapp";
    const password = "clientapp";
    // const password = session.accessToken;
    const vhost = "sni";
    const host = "192.168.1.110";
    const port = 5672;
    const wsPort = 15670;
    const queueName = "unauthorized-requests";

    const tls = false;
    const url = `${tls ? "wss" : "ws"}://${host}:${wsPort}`;
    // const amqp = new AMQPWebSocketClient(url, vhost, user, password);
    // amqp
    //   .connect()
    //   .then(() => {
    //     console.log("connected");

    //     amqp
    //       .connect()
    //       .then((client) => {
    //         console.log("amqp connected");
    //         client
    //           .channel()
    //           .then((channel) => {
    //             channel
    //               .queue(queueName)
    //               .then((queue) => {
    //                 queue
    //                   .publish("test", { deliveryMode: 2 })
    //                   .then(() => {
    //                     console.log("published");
    //                   })
    //                   .catch((err) => {
    //                     console.error(err);
    //                   });
    //               })
    //               .catch((err) => {
    //                 console.error(err);
    //               });
    //           })
    //           .catch((err) => {
    //             console.error(err);
    //           });
    //       })
    //       .catch((err) => {
    //         console.error(err);
    //       });
    //     // amqp.subscribe("sni", "sni", (msg) => {
    //     //   console.log(msg);
    //     // });
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });

    return () => {
      // amqp.close();
    };
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) return;
    if (searchUserQueryDebounced.length === 0) {
      const client = getIsRestClient(session.accessToken);
      client
        .apiUsers()
        .then((res) => {
          setLastOnlineUsers(res);
        })
        .catch((err) => {
          toast.error("Error while fetching users");
        });
      return;
    }

    const client = getIsRestClient(session.accessToken);
    client
      .apiUsersSearch(searchUserQueryDebounced)
      .then((res) => {
        res && setLastOnlineUsers(res);
      })
      .catch((err) => {
        toast.error("Error while fetching users");
      });
  }, [searchUserQueryDebounced, session?.accessToken]);

  // TODO cleanup console debug
  return (
    <>
      <div className="flex flex-col gap-4 p-8">
        <h1>Users</h1>
        <div className="flex flex-col gap-4 rounded w-full p-4 bg-white">
          <span className="font-bold">Search</span>
          <TextField
            fullWidth
            label="Username"
            value={searchUserQuery}
            onChange={(e) => setSearchUserQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-4">
          {lastOnlineUsers.map((user) => (
            <RenderUserCard
              key={user.id}
              user={user}
              onUserSelected={(u) => {
                console.debug(u, connection);
                connection &&
                  connection.state === HubConnectionState.Connected &&
                  connection?.invoke(SignalRHandlers.SendMessageRequest, {
                    requestedUserId: u.id,
                  } as PostUserPublicKeyRequestDto);
                toast.info(
                  <div>
                    Awaiting public key request result for user{" "}
                    <span className="font-bold">{user.userName}</span>
                  </div>,
                  {
                    autoClose: false,
                    toastId: reqPubKeyToastId(u.id || ""),
                  }
                );
              }}
            />
          ))}
        </div>
        <div className="h-[920px]"></div>
      </div>
    </>
  );
}

export const RenderUserCard = ({
  user,
  onUserSelected,
}: {
  user: back_end.GetUserDto;
  onUserSelected?: (user: back_end.GetUserDto) => void;
}) => {
  const { state: certStoreState, dispatch } = useContext(CertStoreContext);
  return (
    <Card>
      <CardContent>
        <div className="text-2xl font-bold">{user.userName}</div>
        <div>{user.lastHeartbeat?.toString()}</div>
        <div>{user.isOnline}</div>
        <Button
          onClick={() => onUserSelected && onUserSelected(user)}
          disabled={!certStoreState.publicKey}
        >
          REQUEST MESSAGE
        </Button>
      </CardContent>
    </Card>
  );
};
