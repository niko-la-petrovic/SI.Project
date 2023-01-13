import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  List,
  ListItem,
  ListItemButton,
  TextField,
} from "@mui/material";
import { MdExpandMore, MdSend } from "react-icons/md";
import {
  MessageStoreActionType,
  MessageStoreContext,
} from "../../store/message-store";

import { SignalRContext } from "../templates/layout";
import { useContext } from "react";

export default function MessagingOverlay() {
  const { connection } = useContext(SignalRContext);
  const { state: messageState, dispatch: messageDispatch } =
    useContext(MessageStoreContext);

  return (
    <div className="flex gap-4 items-end fixed bottom-0 right-0">
      {messageState.users
        .filter((u) => u.chatOpened)
        .map((u) => {
          const userMessages =
            messageState.userMessagesMap.get(u.id || "") || [];
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
                      />
                      <Button
                        variant="outlined"
                        className="p-2"
                        onClick={() => {
                          connection?.invoke("SendMessage", {
                            userId: u.id,
                            text: "Hello",
                          });
                        }}
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
