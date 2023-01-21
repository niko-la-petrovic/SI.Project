import {
  CertStoreActionType,
  CertStoreContext,
  CertStoreLocalStorageKey,
  certStoreInitialState,
  certStoreReducer,
} from "../../store/cert-store";
import {
  IMessagePart,
  MessageStoreActionType,
  MessageStoreContext,
  messageStoreInitialState,
  messageStoreReducer,
} from "../../store/message-store";
import MessagingOverlay, { extractSteg } from "../organisms/messaging-overlay";
import { createContext, useEffect, useReducer, useState } from "react";
import {
  receivedReqPubKeyToastId,
  reqPubKeyToastId,
} from "../../services/toastIds";
import { signIn, useSession } from "next-auth/react";
import signalR, {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";

import { Button } from "@mui/material";
import Footer from "../organisms/footer";
import Head from "next/head";
import Header from "../organisms/header";
import { PostUserPublicKeyRequestMessageDto } from "../../types/dtos";
import forge from "node-forge";
import { getIsApiUrl } from "../../services/auth";
import { toast } from "react-toastify";
import { useInterval } from "usehooks-ts";
import { useRouter } from "next/router";

export enum SignalRHandlers {
  ReceiveMessage = "ReceiveMessage",
  PrivateErrorMessage = "PrivateErrorMessage",
  PublicKeyRequest = "PublicKeyRequest",
  PublicKeyRequestDenied = "PublicKeyRequestDenied",
  PublicKeyRequestAccepted = "PublicKeyRequestAccepted",
  SendMessageRequest = "SendMessageRequest",
  DirectSendMessagePart = "DirectSendMessagePart",
  DirectReceiveMessagePart = "DirectReceiveMessagePart",
}

export interface ComponentProps {
  children: React.ReactNode;
  props?: any;
}

export interface LayoutProps extends ComponentProps {}

export default function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();
  const [certStore, certStoreDispatch] = useReducer(
    certStoreReducer,
    certStoreInitialState
  );
  const [messageStore, messageStoreDispatch] = useReducer(
    messageStoreReducer,
    messageStoreInitialState
  );
  const [connection, setConnection] = useState<HubConnection | null>(null);
  // TODO remove local storage
  // TODO add toast if certStore is empty - force user to load keys
  const [certStoreLoaded, setCertStoreLoaded] = useState<boolean>(false);
  useEffect(() => {
    const storedCertStoreJson = localStorage.getItem(CertStoreLocalStorageKey);
    storedCertStoreJson &&
      certStoreDispatch({
        type: CertStoreActionType.SET_STATE,
        state: JSON.parse(storedCertStoreJson),
      });
    setCertStoreLoaded(true);
  }, []);

  useEffect(() => {
    if (!certStoreLoaded) return;
    localStorage.setItem(CertStoreLocalStorageKey, JSON.stringify(certStore));
  }, [certStore, certStoreLoaded]);

  useEffect(() => {
    const accessToken = session?.accessToken;
    if (!accessToken) return;

    const newConnection = new HubConnectionBuilder()
      .withUrl(`${getIsApiUrl()}/hubs/client-online`, {
        accessTokenFactory: () => accessToken,
      })
      .configureLogging(2)
      .withAutomaticReconnect() // TODO reconnect logic
      .build();

    newConnection.start().then((c) => {
      setConnection(newConnection);
    });

    return () => {
      newConnection.stop();
    };
  }, [session?.accessToken]);

  useEffect(() => {
    if (!connection) return;

    const handlePublicKeyRequest = (
      request: PostUserPublicKeyRequestMessageDto
    ) => {
      console.debug(request);
      const pubKeyPem = request.requestorPublicKey;
      const pubKey = forge.pki.publicKeyFromPem(pubKeyPem);
      const pubKeyFingerPrint = forge.pki.getPublicKeyFingerprint(pubKey);
      const pubKeyFingerPrintHex = pubKeyFingerPrint.toHex();
      const toastId = receivedReqPubKeyToastId(pubKeyFingerPrintHex);
      toast.info(
        <div className="flex flex-col gap-2">
          <div>
            User <span className="font-bold">{request.requestor.userName}</span>{" "}
            requests your public key. Their public key&apos;s fingerprint is{" "}
            <span className="font-bold">{pubKeyFingerPrintHex}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                toast.dismiss(toastId);
                connection.invoke("AcceptPublicKeyRequest", request);
                const publicKey = forge.pki.publicKeyFromPem(
                  request.requestorPublicKey
                );
                const publicKeyFingerprint =
                  forge.pki.getPublicKeyFingerprint(publicKey);
                messageStoreDispatch({
                  type: MessageStoreActionType.ADD_USER,
                  user: {
                    id: request.requestor.id,
                    userName: request.requestor.userName,
                    publicKey: publicKey,
                    chatOpened: false,
                    publicKeyThumbprintHex: publicKeyFingerprint.toHex(),
                  },
                });
              }}
            >
              Accept
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                toast.dismiss(toastId);
                // TODO closure problem
                // TODO add dependency on connection - return from useEffect if ...
                connection.invoke("DenyPublicKeyRequest", request);
              }}
            >
              Deny
            </Button>
          </div>
        </div>,
        {
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
          toastId: toastId,
        }
      );
    };

    const handlePublicKeyRequestDenied = (userId: string, userName: string) => {
      toast.dismiss(reqPubKeyToastId(userId));
      toast.error(
        <div>
          User <span className="font-bold">{userName}</span> denied your request
          for their public key
        </div>
      );
    };

    const handlePublicKeyRequestAccepted = (
      userId: string,
      userName: string,
      publicKeyPem: string
    ) => {
      console.debug(userId, userName, publicKeyPem);
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
      const publicKeyThumbprint = forge.pki.getPublicKeyFingerprint(publicKey);
      const publicKeyThumbprintHex = publicKeyThumbprint.toHex();
      toast.dismiss(reqPubKeyToastId(userId));
      toast.success(
        <div>
          User <span className="font-bold">{userName}</span> accepted your
          request for their public key. Their public key&apos;s thumbprint is{" "}
          <span className="font-bold">{publicKeyThumbprintHex}</span>
        </div>,
        {
          autoClose: 5000,
        }
      );
      messageStoreDispatch({
        type: MessageStoreActionType.ADD_USER,
        user: {
          id: userId,
          userName: userName,
          publicKey: publicKey,
          publicKeyThumbprintHex: publicKeyThumbprintHex,
          chatOpened: false,
        },
      });
    };

    const handleDirectReceiveMessagePart = (messagePart: IMessagePart) => {
      console.debug(messagePart);

      console.debug(messageStore.users);
      const senderPublicKey = messageStore.users.find(
        (u) => u.id === messagePart.senderId
      )?.publicKey;

      if (!senderPublicKey) {
        toast.error(
          `Received message part from user ${messagePart.senderId} but their public key is not known`
        );
        return;
      }

      const hashAlgorithm = messagePart.hashAlgorithm as forge.md.Algorithm;
      if (!hashAlgorithm) {
        toast.error(
          `Received message part with unknown hash algorithm ${messagePart.hashAlgorithm}`
        );
        return;
      }

      console.debug(messagePart.encrypted);
      extractSteg(messagePart.encrypted).then((steg) => {
        const encrypted = steg;

        const messageDigest = forge.md.algorithms[hashAlgorithm].create();
        messageDigest.update(encrypted);
        const hash = messageDigest.digest().bytes();
        const verifiedSignature = senderPublicKey.verify(
          hash,
          messagePart.signature
        );
        if (!verifiedSignature) {
          toast.error(`Received message part with invalid signature`);
          return;
        }

        const messagePartDecrypted = certStore.privateKey?.decrypt(encrypted);
        if (!messagePartDecrypted) {
          toast.error(`Failed to decrypt message part`);
          return;
        }

        messageStoreDispatch({
          type: MessageStoreActionType.ADD_MESSAGE_PART,
          messagePart: {
            ...messagePart,
            decryptedText: messagePartDecrypted,
          },
        });

        console.log(JSON.stringify(messagePartDecrypted));
      });
    };

    Object.keys(SignalRHandlers).forEach((handler) => {
      connection.off(handler);
    });
    connection.on(SignalRHandlers.ReceiveMessage, (user, message) => {
      toast(`${user}: ${message}`);
    });
    connection.on(SignalRHandlers.PrivateErrorMessage, (message) => {
      toast.error(message);
    });
    connection.on(SignalRHandlers.PublicKeyRequest, handlePublicKeyRequest);
    connection.on(
      SignalRHandlers.PublicKeyRequestDenied,
      handlePublicKeyRequestDenied
    );
    connection.on(
      SignalRHandlers.PublicKeyRequestAccepted,
      handlePublicKeyRequestAccepted
    );
    connection.on(
      SignalRHandlers.DirectReceiveMessagePart,
      handleDirectReceiveMessagePart
    );
    connection.onclose(() => {
      toast("Connection closed");
    });
    connection.onreconnecting(() => {
      toast("Connection reconnecting");
    });
  }, [certStore.privateKey, connection, messageStore.users]);

  useEffect(() => {
    if (session?.error) {
      // TODO - handle
      // signIn("identityServer", { callbackUrl: router.asPath });
      signIn("identityServer");
    }

    if (status === "unauthenticated" && router.pathname !== "/unauthenticated")
      router.push("/unauthenticated");

    if (session && router.pathname === "/unauthenticated") router.push("/");
  }, [router, session, status]);

  useInterval(() => {
    if (!(connection && connection.state === HubConnectionState.Connected))
      return;

      // TODO send heartbeat only if public and private key configured

    connection?.invoke("SendHeartbeat");
  }, 5000);

  return (
    <div className="layout">
      <Head>
        <title>SNI ClientApp</title>
        <meta name="description" content="SNI ClientApp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SignalRContext.Provider
        value={{
          connection: connection,
        }}
      >
        <CertStoreContext.Provider
          value={{ state: certStore, dispatch: certStoreDispatch }}
        >
          <MessageStoreContext.Provider
            value={{ state: messageStore, dispatch: messageStoreDispatch }}
          >
            <main className={`flex flex-col min-h-screen justify-between`}>
              <Header drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
              {children}
              <MessagingOverlay />
              {/* TODO remove */}
              {/* <button
                onClick={() => {
                  if (!isWorkingConnection) return;
                  connection?.invoke("SendMessage", "user", "message");
                  connection?.invoke("SendHeartbeat");
                }}
              >
                Send Message
              </button> */}
              <Footer />
            </main>
          </MessageStoreContext.Provider>
        </CertStoreContext.Provider>
      </SignalRContext.Provider>
    </div>
  );
}

export const initialSignalRContext: {
  connection: HubConnection | null;
} = {
  connection: null,
};

export const SignalRContext = createContext(initialSignalRContext);
