import "../styles/globals.css";

import { ReactElement, ReactNode } from "react";

import type { AppProps } from "next/app";
import { NextPage } from "next";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export type AppPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: AppPageWithLayout;
  session: Session;
};

export default function App({
  Component,
  session,
  pageProps,
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <div>
      <SessionProvider
        session={session}
        refetchInterval={5 * 60} // 5 minutes
        refetchOnWindowFocus={true}
      >
        {getLayout(<Component {...pageProps} />)}
        {/* TODO */}
        {/* <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          theme={"light"}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        /> */}
      </SessionProvider>
    </div>
  );
}
