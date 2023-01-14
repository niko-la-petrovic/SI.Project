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
import { MdExpandMore, MdSend } from "react-icons/md";
import { SignalRContext, SignalRHandlers } from "../templates/layout";

import { CertStoreContext } from "../../store/cert-store";
import forge from "node-forge";
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
    if (!receiverPublicKey) return;
    console.log(receiverPublicKey);

    const senderPrivateKey = certStoreState.privateKey;
    if (!senderPrivateKey) return;

    const messagePlaintextLength = preparedMessageText.length;
    // TODO split
    // const utfEncode = new TextEncoder();
    // const messageBytes = utfEncode.encode(preparedMessageText);
    // console.log(messageBytes);

    const messageId = uuidv4();
    const messagePartsCount = 3; // Math.random()*() +3
    const messageParts = [];
    for (
      let messagePartIndex = 0;
      messagePartIndex < messagePartsCount;
      messagePartIndex++
    ) {
      // TODO for each part
      const messagePartText = preparedMessageText.substring(
        messagePartIndex * messagePartsCount,
        (messagePartIndex + 1) * messagePartsCount
      );

      const encrypted = receiverPublicKey.encrypt(messagePartText);
      console.log(encrypted);
      const messageDigest = forge.sha256.create();
      messageDigest.update(encrypted);
      const hash = messageDigest.digest();
      console.log(hash, hash.bytes(), hash.toHex());
      const signedMessageDigest = senderPrivateKey.sign(messageDigest);
      console.log(signedMessageDigest);

      // TODO remove
      const senderPublicKey =
        certStoreState.publicKey as forge.pki.rsa.PublicKey;
      if (!senderPublicKey) return;
      const verifyResult = senderPublicKey.verify(
        hash.bytes(),
        signedMessageDigest
      );
      console.log(verifyResult);

      const messagePart: IMessagePart = {
        id: messageId,
        senderId: session?.user.id || "",
        receiverId: userId || "",
        partIndex: messagePartIndex,
        partsCount: messagePartsCount,
        encrypted: encrypted,
        hash: hash.bytes(),
        signature: signedMessageDigest,
      };
      messageParts.push(messagePart);

      connection?.invoke(SignalRHandlers.DirectSendMessagePart, messagePart);
    }
    console.log(messageParts);
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
          return (
            <div key={u.id} className="w-64 bg-white rounded-t-lg">
              <Accordion>
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <div className="flex w-full items-center justify-between pr-4">
                    <span className="font-bold text-lg">{u.userName}</span>
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
                      <List disablePadding>
                        {userMessages.map((message) => (
                          <ListItem key={message.id} disablePadding>
                            <ListItemButton>
                              <span>{message.text}</span>
                            </ListItemButton>
                          </ListItem>
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
                          <span>{user.userName}</span>
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
