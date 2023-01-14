import { back_end } from "../clients/is-rest-client";
import { createContext } from "react";
import forge from "node-forge";

// TODO add user personal info props
export type IUser = back_end.IGetUserDto & {
  chatOpened: boolean;
  publicKey?: forge.pki.rsa.PublicKey | undefined;
  publicKeyThumbprintHex?: string | undefined;
};

export type IMessage = {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
};

export type IMessagePart = {
  id: string;
  senderId: string;
  receiverId: string;
  partIndex: number;
  partsCount: number;
  encrypted: string;
  hashAlgorithm: string;
  hash: string;
  signature: string;
};

export type IDecrtypedMessagePart = IMessagePart & {
  decryptedText: string;
};

export enum MessageStoreActionType {
  ADD_USER = "ADD_USER",
  REMOVE_USER = "REMOVE_USER",
  ADD_USER_PUBLIC_KEY = "ADD_USER_PUBLIC_KEY",
  OPEN_CHAT = "OPEN_CHAT",
  SET_MESSAGE_INPUT = "SET_MESSAGE_INPUT",
  ADD_MESSAGE_PART = "ADD_MESSAGE_PART",
}

export type MessageStoreAction =
  | {
      type: MessageStoreActionType.ADD_USER;
      user: IUser;
    }
  | {
      type: MessageStoreActionType.REMOVE_USER;
      userId: string;
    }
  | {
      type: MessageStoreActionType.ADD_USER_PUBLIC_KEY;
      userId: string;
      publicKey: forge.pki.rsa.PublicKey;
    }
  | {
      type: MessageStoreActionType.OPEN_CHAT;
      userId: string;
    }
  | {
      type: MessageStoreActionType.SET_MESSAGE_INPUT;
      userId: string;
      messageInput: string;
    }
  | {
      type: MessageStoreActionType.ADD_MESSAGE_PART;
      messagePart: IDecrtypedMessagePart;
    };

// TODO change message type
export type MessageStoreState = {
  users: IUser[];
  messagePartsMap: Map<string, Map<number, IDecrtypedMessagePart>>;
  userMessagesMap: Map<string, IMessage[]>;
  userMessageInputsMap: Map<string, string>;
};

export const messageStoreInitialState: MessageStoreState = {
  users: [],
  messagePartsMap: new Map(),
  userMessagesMap: new Map(),
  userMessageInputsMap: new Map(),
};

export const MessageStoreContext = createContext({
  state: messageStoreInitialState,
  dispatch: (action: MessageStoreAction) => {},
});

export const messageStoreReducer = (
  state: MessageStoreState,
  action: MessageStoreAction
): MessageStoreState => {
  switch (action.type) {
    case MessageStoreActionType.ADD_MESSAGE_PART: {
      const messagePart = action.messagePart;

      const messagePartId = messagePart.id;
      const messageParts = state.messagePartsMap.get(messagePartId);
      if (!messageParts) {
        return {
          ...state,
          messagePartsMap: new Map([
            ...Array.from(state.messagePartsMap),
            [messagePartId, new Map([[messagePart.partIndex, messagePart]])],
          ]),
        };
      } else {
        if (messageParts.size + 1 === messagePart.partsCount) {
          const messagePartsArray = Array.from(messageParts);
          messagePartsArray.push([messagePart.partIndex, messagePart]);
          messagePartsArray.sort((a, b) => a[0] - b[0]);
          const decryptedText = messagePartsArray
            .map((mp) => mp[1].decryptedText)
            .join("");
          const message: IMessage = {
            id: messagePartId,
            text: decryptedText,
            timestamp: new Date(), // TODO something like timestamp authority
            senderId: messagePart.senderId,
          };
          const senderId = messagePart.senderId;
          const userMessages = state.userMessagesMap.get(senderId);
          if (userMessages) {
            return {
              ...state,
              messagePartsMap: new Map([
                ...Array.from(state.messagePartsMap),
                [messagePartId, new Map(messagePartsArray)],
              ]),
              userMessagesMap: new Map([
                ...Array.from(state.userMessagesMap),
                [senderId, [...userMessages, message]],
              ]),
            };
          } else {
            return {
              ...state,
              messagePartsMap: new Map([
                ...Array.from(state.messagePartsMap),
                [messagePartId, new Map(messagePartsArray)],
              ]),
              userMessagesMap: new Map([
                ...Array.from(state.userMessagesMap),
                [senderId, [message]],
              ]),
            };
          }
        } else {
          return {
            ...state,
            messagePartsMap: new Map([
              ...Array.from(state.messagePartsMap),
              [
                messagePartId,
                new Map([
                  ...Array.from(messageParts),
                  [messagePart.partIndex, messagePart],
                ]),
              ],
            ]),
          };
        }
      }
    }
    case MessageStoreActionType.ADD_USER:
      return {
        ...state,
        users: [
          ...state.users.filter((u) => u.id !== action.user.id),
          action.user,
        ],
      };
    case MessageStoreActionType.OPEN_CHAT:
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId
            ? {
                ...u,
                chatOpened: true,
              }
            : u
        ),
      };
    case MessageStoreActionType.REMOVE_USER:
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.userId),
      };

    case MessageStoreActionType.SET_MESSAGE_INPUT:
      return {
        ...state,
        userMessageInputsMap: new Map([
          ...Array.from(state.userMessageInputsMap),
          [action.userId, action.messageInput],
        ]),
      };
    case MessageStoreActionType.ADD_USER_PUBLIC_KEY:
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId
            ? {
                ...u,
                publicKey: action.publicKey,
              }
            : u
        ),
      };
    default:
      return state;
  }
};
