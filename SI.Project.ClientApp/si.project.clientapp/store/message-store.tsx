import { back_end } from "../clients/is-rest-client";
import { createContext } from "react";
import forge from "node-forge";

// TODO add user personal info props
export type IUser = back_end.IGetUserDto & {
  chatOpened: boolean;
  publicKey?: forge.pki.PublicKey | undefined;
  publicKeyThumbprintHex?: string | undefined;
};

export type IMessage = {
  id: string;
  text: string;
};

export enum MessageStoreActionType {
  ADD_USER = "ADD_USER",
  REMOVE_USER = "REMOVE_USER",
  ADD_USER_PUBLIC_KEY = "ADD_USER_PUBLIC_KEY",
  OPEN_CHAT = "OPEN_CHAT",
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
      publicKey: forge.pki.PublicKey;
    }
  | {
      type: MessageStoreActionType.OPEN_CHAT;
      userId: string;
    };

// TODO change message type
export type MessageStoreState = {
  users: IUser[];
  userMessagesMap: Map<string, IMessage[]>;
};

export const messageStoreInitialState: MessageStoreState = {
  users: [],
  userMessagesMap: new Map(),
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
