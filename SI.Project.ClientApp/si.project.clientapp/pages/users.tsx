import { Button, Card, CardContent, TextField } from "@mui/material";
import {
  SignalRContext,
  SignalRHandlers,
} from "../components/templates/layout";
import {
  applySteg,
  extractSteg,
} from "../components/organisms/messaging-overlay";
import { useContext, useEffect, useState } from "react";

import { AMQPClient } from "@cloudamqp/amqp-client";
import { AMQPWebSocketClient } from "@cloudamqp/amqp-client";
import { CertStoreContext } from "../store/cert-store";
import { HubConnectionState } from "@microsoft/signalr";
import Jimp from "jimp";
import { PostUserPublicKeyRequestDto } from "../types/dtos";
import { arrayBuffer } from "stream/consumers";
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
        <div className="h-[920px]">
          <button
            onClick={() => {
              const text1 =
                '\x17Øï«ë%\x1A\x114\x10g\\75¼ic\vÖVÅ\x85d­V\x9BÊÁ\x97[ïº9\x03d|úú.g\x1F]ú\x10+¨@=,F¨ß/¼H\x19Zü±»kUÏ4Þ\x80O\x8Bd%&@MÒ·\x8AÃr.\x81w\x07oû\x96O&ý>\x9FèKBñX\x07eÈyÛ\x9D´ÈÉ\t:S\x05å\x9E®N\r\x04ùD\x19L/êX£0CU|/\x15ÑÞY\x131\x8EQxyjp\x8ETÐ\x04\x84å\x92Wv\x12_\x1DhÑâô\fÞÃOelÐìÞï\x13@ t"\x8EÍ\x12[Îï\x0F\x18\nu\v\x18$zñØ8?\x184\x83»4\x15¼<b\x11¬yÓòÙ\x0E½¶õû(\x8DCÂ\x9B\x157ãh`\x9D\x81\x15\x1A@ÍL:¾£\x1FÂN\x16\v\x06ã»ãz\x024\x96\x95êóEC¾t]ÞóÃÙ¯<Ð';

              applySteg(text1)
                .then((url) => {
                  extractSteg(url)
                    .then((text2) => {
                      console.log(text2 === text1, {
                        original: text1,
                        extracted: text2,
                      });
                    })
                    .catch((err) => {
                      toast.error("Error while extracting steg");
                      console.error(err);
                    });
                })
                .catch((err) => {
                  toast.error("Error while applying steg");
                  console.error(err);
                });

              return;
              const text = "abc";
              console.log(JSON.stringify(text));
              const messageBuffer = Buffer.from(text);
              console.log(messageBuffer);

              fetch("https://picsum.photos/100")
                .then((res) => res.blob())
                .then((blob) => {
                  blob.arrayBuffer().then((arrayBuffer) => {
                    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
                    console.log(buffer);
                    Jimp.read(buffer)
                      .then((image) => {
                        image.getBufferAsync(Jimp.MIME_BMP).then((buffer) => {
                          console.log(buffer);

                          // BMP header start
                          let bufferByteIndex = 54;

                          // write message length
                          const length = messageBuffer.length;
                          for (let i = 0; i < 4; i++) {
                            const byteValue = (length >> (i * 8)) & 0xff;
                            for (let j = 0; j < 8; j++) {
                              const bitValue = (byteValue >> j) & 1;
                              const currentByte = buffer[bufferByteIndex];
                              const newByte = (currentByte & 0xfe) | bitValue;
                              buffer[bufferByteIndex] = newByte;
                              bufferByteIndex++;
                            }
                          }

                          for (let i = 0; i < messageBuffer.length; i++) {
                            let messageByte = messageBuffer[i];
                            for (let j = 0; j < 8; j++) {
                              let messageBit = (messageByte >> j) & 1;
                              const currentByte = buffer[bufferByteIndex];
                              const newByte = (currentByte & 0xfe) | messageBit;
                              buffer[bufferByteIndex] = newByte;
                              bufferByteIndex++;
                            }
                          }

                          Jimp.read(buffer).then((img) => {
                            img.getBase64(Jimp.MIME_BMP, (err, url) => {
                              console.log(url);
                              setImageUrl(url);

                              Jimp.read(url).then((img) => {
                                img
                                  .getBufferAsync(Jimp.MIME_BMP)
                                  .then((buffer) => {
                                    console.log(buffer);
                                    let bufferByteIndex = 54;
                                    let length = 0;
                                    for (let i = 0; i < 4; i++) {
                                      let byteValue = 0;
                                      for (let j = 0; j < 8; j++) {
                                        const currentByte =
                                          buffer[bufferByteIndex];
                                        const currentBit = currentByte & 1;
                                        byteValue |= currentBit << j;
                                        bufferByteIndex++;
                                      }
                                      length |= byteValue << (i * 8);
                                    }
                                    console.log(length);
                                    const messageBuffer = Buffer.alloc(length);
                                    for (let i = 0; i < length; i++) {
                                      let messageByte = 0;
                                      for (let j = 0; j < 8; j++) {
                                        const currentByte =
                                          buffer[bufferByteIndex];
                                        const currentBit = currentByte & 1;
                                        messageByte |= currentBit << j;
                                        bufferByteIndex++;
                                      }
                                      messageBuffer[i] = messageByte;
                                    }
                                    const reconstructedMessage =
                                      messageBuffer.toString();
                                    console.log(
                                      JSON.stringify(reconstructedMessage)
                                    );
                                    console.log(reconstructedMessage === text);
                                  });
                              });
                            });
                          });
                        });
                      })
                      .catch((err) => {
                        console.error(err);
                      });
                  });
                });
            }}
          >
            test
          </button>
          {imageUrl && <img src={imageUrl}></img>}
        </div>
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
