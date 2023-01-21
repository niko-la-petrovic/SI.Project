import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  List,
  ListItem,
  ListItemButton,
  TextField,
  formGroupClasses,
} from "@mui/material";
import {
  IMessagePart,
  MessageStoreActionType,
  MessageStoreContext,
} from "../../store/message-store";
import { MdArrowLeft, MdExpandMore, MdSend } from "react-icons/md";
import { SignalRContext, SignalRHandlers } from "../templates/layout";

import Avvvatars from "avvvatars-react";
import { CertStoreContext } from "../../store/cert-store";
import { HubConnection } from "@microsoft/signalr";
import Jimp from "jimp";
import _ from "lodash";
import forge from "node-forge";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useContext } from "react";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";

export default function MessagingOverlay() {
  const { data: session } = useSession();
  const { connection } = useContext(SignalRContext);
  const { state: messageState, dispatch: messageDispatch } =
    useContext(MessageStoreContext);
  const { state: certStoreState, dispatch: certStoreDispatch } =
    useContext(CertStoreContext);

  const handleMessageSend = async (userId: string | undefined) => {
    const messageText =
      messageState.userMessageInputsMap.get(userId || "") || "";
    if (messageText === "") return;

    const preparedMessageText =
      messageText.length <= 3
        ? messageText + " ".repeat(3 - messageText.length)
        : messageText;
    console.log(JSON.stringify(preparedMessageText));

    const receiverPublicKey = messageState.users.find(
      (u) => u.id === userId
    )?.publicKey;
    if (!receiverPublicKey) {
      toast.error("Recipient's public key not found");
      return;
    }
    console.log(receiverPublicKey);

    const senderPrivateKey = certStoreState.privateKey;
    if (!senderPrivateKey) {
      toast.error("You haven't configured a private key");
      return;
    }

    const messageId = uuidv4();
    messageDispatch({
      type: MessageStoreActionType.ADD_MY_MESSAGE,
      message: {
        id: uuidv4(),
        senderId: session?.user?.id || "",
        fromMe: true,
        text: preparedMessageText,
        timestamp: new Date(),
      },
      receiverId: userId || "",
    });

    // TODO add steganography
    const messagePlaintextLength = preparedMessageText.length;
    const tryDivideInto = 3; // Math.random()*() +3
    const messagePartSize = Math.floor(messagePlaintextLength / tryDivideInto);
    const messageParts = _.chunk(
      Array.from(preparedMessageText),
      messagePartSize
    );
    const messagePartsCount = messageParts.length;
    console.log(messageParts);

    // TODO remove
    const senderPublicKey = certStoreState.publicKey as forge.pki.rsa.PublicKey;
    if (!senderPublicKey) return;
    console.debug(senderPublicKey);

    for (
      let messagePartIndex = 0;
      messagePartIndex < messageParts.length;
      messagePartIndex++
    ) {
      const messagePartText = messageParts[messagePartIndex].join("");
      console.log(JSON.stringify(messagePartText));

      const encrypted = receiverPublicKey.encrypt(messagePartText);
      console.log(encrypted);
      const messageDigest = forge.sha256.create();
      const hashAlgorithm = messageDigest.algorithm;
      messageDigest.update(encrypted);
      const hash = messageDigest.digest();
      console.log(hash, hash.bytes(), hash.toHex());
      const signedMessageDigest = senderPrivateKey.sign(messageDigest);
      console.log(signedMessageDigest);

      const verifyResult = senderPublicKey.verify(
        hash.bytes(),
        signedMessageDigest
      );
      console.log(verifyResult);

      applySteg(encrypted)
        .then((steg) => {
          const messagePart: IMessagePart = {
            id: messageId,
            senderId: session?.user.id || "",
            receiverId: userId || "",
            partIndex: messagePartIndex,
            partsCount: messagePartsCount,
            encrypted: steg,
            hash: hash.bytes(),
            hashAlgorithm: hashAlgorithm,
            signature: signedMessageDigest,
          };

          connection?.invoke(
            SignalRHandlers.DirectSendMessagePart,
            messagePart
          );

          extractSteg(steg).then((extracted) => {
            console.log(extracted === encrypted, encrypted, extracted);
          });
        })
        .catch((e) => {
          toast.error("Failed to apply steganography");
          console.error(e);
        });
    }
  };

  return (
    <div className="flex gap-4 items-end fixed bottom-0 right-0">
      {messageState.users
        .filter((u) => u.chatOpened)
        .map((u) => {
          const userMessages =
            messageState.userMessagesMap.get(u.id || "") || [];
          const userMessageInput =
            messageState.userMessageInputsMap.get(u.id || "") || "";
          // TODO extract to own component. scroll to bottom on messages change from given user
          return (
            <div key={u.id} className="w-64 bg-white rounded-t-lg">
              <Accordion>
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <div className="flex w-full items-center justify-between pr-4">
                    <div className="flex items-center gap-2">
                      {u.publicKeyThumbprintHex && (
                        <Avvvatars
                          value={u.publicKeyThumbprintHex}
                          shadow
                          style="shape"
                        />
                      )}
                      <span className="font-bold text-lg">{u.userName}</span>
                    </div>
                    <span className="text-sm">
                      {u.publicKeyThumbprintHex?.substring(0, 10)}...
                    </span>
                  </div>
                </AccordionSummary>
                <AccordionDetails className="px-0">
                  <div className="flex flex-col gap-4">
                    <div className="font-bold px-4">Messages</div>
                    {userMessages.length == 0 ? (
                      <div className="text-gray-400 px-4 text-sm">
                        You have no messages with this user
                      </div>
                    ) : (
                      <List disablePadding className="max-h-64 overflow-auto">
                        {userMessages.map((message, i) => (
                          <div key={message.id}>
                            {i % 5 === 0 && (
                              <div className="flex justify-center">
                                <span className="text-sm text-gray-400 whitespace-nowrap">
                                  {format(message.timestamp, "HH:mm dd.MM")}
                                </span>
                              </div>
                            )}
                            <ListItem disablePadding>
                              <ListItemButton>
                                <div className="flex w-full gap-2 items-start justify-between">
                                  <div
                                    className={`flex-grow flex ${
                                      message.fromMe ? "justify-end" : ""
                                    }`}
                                  >
                                    <span
                                      className={`break-all rounded-xl p-2 ${
                                        message.fromMe
                                          ? "bg-blue-100"
                                          : "bg-red-100"
                                      }`}
                                    >
                                      {message.text}
                                    </span>
                                  </div>
                                </div>
                              </ListItemButton>
                            </ListItem>
                          </div>
                        ))}
                      </List>
                    )}
                    <div className="w-full px-4 gap-4 flex items-center justify-between">
                      <TextField
                        className="p-0"
                        placeholder="Message"
                        variant="outlined"
                        inputProps={{
                          className: "p-2",
                        }}
                        value={
                          messageState.userMessageInputsMap.get(u.id || "") ||
                          ""
                        }
                        onChange={(e) => {
                          messageDispatch({
                            type: MessageStoreActionType.SET_MESSAGE_INPUT,
                            userId: u.id || "",
                            messageInput: e.target.value,
                          });
                        }}
                      />
                      <Button
                        variant="outlined"
                        className="p-2"
                        disabled={userMessageInput === ""}
                        onClick={() => handleMessageSend(u.id)}
                      >
                        <MdSend className="text-lg" />
                      </Button>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
          );
        })}
      <div className="w-64 bg-white rounded-t-lg">
        <Accordion>
          <AccordionSummary expandIcon={<MdExpandMore />}>
            <span className="font-bold text-lg">Messaging</span>
          </AccordionSummary>
          <AccordionDetails className="px-0">
            <div className="flex flex-col gap-2">
              <div className="font-bold px-4">Users</div>
              {messageState.users.length == 0 ? (
                <div className="text-gray-400 px-4 text-sm">
                  You have no users ready for messaging
                </div>
              ) : (
                <List disablePadding>
                  {messageState.users.map((user) => {
                    return (
                      <ListItem key={user.id} disablePadding>
                        <ListItemButton
                          onClick={() =>
                            messageDispatch({
                              type: MessageStoreActionType.OPEN_CHAT,
                              userId: user.id || "",
                            })
                          }
                          className="flex justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {user.publicKeyThumbprintHex && (
                              <Avvvatars
                                value={user.publicKeyThumbprintHex}
                                shadow
                                style="shape"
                              />
                            )}
                            <span>{user.userName}</span>
                          </div>
                          <span>
                            {user.publicKeyThumbprintHex?.substring(0, 8)}...
                          </span>
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}

export const applySteg = (message: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const messageBuffer = Buffer.from(forge.util.encode64(message), "utf8");
    fetch("https://picsum.photos/100")
      .then((res) => res.blob())
      .then((blob) => {
        blob.arrayBuffer().then((arrayBuffer) => {
          const buffer = Buffer.from(new Uint8Array(arrayBuffer));
          console.log(buffer);
          Jimp.read(buffer).then((image) => {
            image.getBufferAsync(Jimp.MIME_BMP).then((buffer) => {
              console.log(buffer);

              // BMP header start
              let bufferByteIndex = 54;

              if (
                bufferByteIndex + 32 + messageBuffer.length * 8 >
                buffer.length
              ) {
                reject("Message too long");
                return;
              }
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

              Jimp.read(buffer).then((image) => {
                image.getBase64(Jimp.MIME_BMP, (err, url) => {
                  resolve(url);
                });
              });
            });
          });
        });
      });
  });
};

export const extractSteg = (base64: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    Jimp.read(base64).then((img) => {
      img.getBufferAsync(Jimp.MIME_BMP).then((buffer) => {
        console.log(buffer);
        let bufferByteIndex = 54;
        let length = 0;
        for (let i = 0; i < 4; i++) {
          let byteValue = 0;
          for (let j = 0; j < 8; j++) {
            const currentByte = buffer[bufferByteIndex];
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
            const currentByte = buffer[bufferByteIndex];
            const currentBit = currentByte & 1;
            messageByte |= currentBit << j;
            bufferByteIndex++;
          }
          messageBuffer[i] = messageByte;
        }
        const reconstructedMessage = forge.util.decode64(
          messageBuffer.toString()
        );
        console.log(reconstructedMessage);
        resolve(reconstructedMessage);
      });
    });
  });
};
