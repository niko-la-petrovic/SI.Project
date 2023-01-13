import {
  CertStoreActionType,
  CertStoreContext,
  CertStoreLocalStorageKey,
  CertStoreState,
  certStoreInitialState,
  certStoreReducer,
} from "../../store/cert-store";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import { createContext, useEffect, useReducer, useState } from "react";
import {
  receivedReqPubKeyToastId,
  reqPubKeyToastId,
} from "../../services/toastIds";
import { signIn, useSession } from "next-auth/react";

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
  const [connection, setConnection] = useState<HubConnection | null>(null);

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
      .withAutomaticReconnect() // TODO reconnect logic
      .build();

    const handlePublicKeyRequest = (
      request: PostUserPublicKeyRequestMessageDto
    ) => {
      console.debug(request);
      const pubKeyPem = request.requestorPublicKey;
      const pubKey = forge.pki.publicKeyFromPem(pubKeyPem);
      const pubKeyFingerPrint = forge.pki.getPublicKeyFingerprint(pubKey);
      const pubKeyFingerPrintHex = pubKeyFingerPrint.toHex();
      const toastId = receivedReqPubKeyToastId(pubKeyFingerPrintHex);
      const toasted = toast.info(
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
                newConnection.invoke("AcceptPublicKeyRequest", request);
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
                newConnection.invoke("DenyPublicKeyRequest", request);
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
    };

    newConnection.on("ReceiveMessage", (user, message) => {
      toast(`${user}: ${message}`);
    });
    newConnection.on("PrivateErrorMessage", (message) => {
      toast.error(message);
    });
    newConnection.on("PublicKeyRequest", handlePublicKeyRequest);
    newConnection.on("PublicKeyRequestDenied", handlePublicKeyRequestDenied);
    newConnection.on(
      "PublicKeyRequestAccepted",
      handlePublicKeyRequestAccepted
    );
    newConnection.onclose(() => {
      toast("Connection closed");
    });
    newConnection.onreconnecting(() => {
      toast("Connection reconnecting");
    });

    newConnection.start();
    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, [session?.accessToken]);

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
          <main className={`flex flex-col min-h-screen justify-between`}>
            <Header drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
            {children}
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
