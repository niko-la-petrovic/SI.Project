import {
  CertStoreContext,
  certStoreInitialState,
  certStoreReducer,
} from "../../store/cert-store";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useReducer, useState } from "react";

import Footer from "../organisms/footer";
import Head from "next/head";
import Header from "../organisms/header";
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
  const { data: session } = useSession();
  const [certStore, certStoreDispatch] = useReducer(
    certStoreReducer,
    certStoreInitialState
  );
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    const accessToken = session?.accessToken;
    if (!accessToken) return;

    const newConnection = new HubConnectionBuilder()
      .withUrl(`${getIsApiUrl()}/hubs/client-online`, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect() // TODO reconnect logic
      .build();

    newConnection.on("ReceiveMessage", (user, message) => {
      toast(`${user}: ${message}`);
    });
    newConnection.onclose(() => {
      toast("Connection closed");
    });
    newConnection.onreconnecting(() => {
      toast("Connection reconnecting");
    });

    newConnection.start();

    setConnection(newConnection);
  }, [session?.accessToken]);

  const isWorkingConnection =
    connection && connection.state === HubConnectionState.Connected;

  useEffect(() => {
    if (session?.error) {
      // TODO - handle
      // signIn("identityServer", { callbackUrl: router.asPath });
      signIn("identityServer");
    }

    if (!session && router.pathname !== "/unauthenticated")
      router.push("/unauthenticated");

    if (session && router.pathname === "/unauthenticated") router.push("/");
  }, [router, session]);

  useInterval(() => {
    if (!isWorkingConnection) return;

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
    </div>
  );
}
