import {
  CertStoreContext,
  certStoreInitialState,
  certStoreReducer,
} from "../../store/cert-store";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useReducer, useState } from "react";

import Footer from "../organisms/footer";
import Head from "next/head";
import Header from "../organisms/header";
import { HubConnection } from "@microsoft/signalr/dist/esm/HubConnection";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { createSignalRContext } from "react-signalr";
import { getIsApiUrl } from "../../services/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export interface ComponentProps {
  children: React.ReactNode;
  props?: any;
}

export interface LayoutProps extends ComponentProps {}

const SignalRContext = createSignalRContext();

export default function Layout({ children, ...props }: LayoutProps) {
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
      .withAutomaticReconnect()
      .build();

    newConnection.on("ReceiveMessage", (user, message) => {
      toast(`${user}: ${message}`);
    });
    newConnection.start();

    setConnection(newConnection);
  }, [session?.accessToken]);

  // TODO
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
          <button
            onClick={() => {
              connection?.invoke("SendMessage", "user", "message");
            }}
          >
            Send Message
          </button>
          <Footer />
        </main>
      </CertStoreContext.Provider>
    </div>
  );
}
