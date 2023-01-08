import "../styles/globals.css";
import "nprogress/nprogress.css";
import 'react-toastify/dist/ReactToastify.css'

import { ReactElement, ReactNode } from "react";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { AppProps } from "next/app";
import Layout from "../components/templates/layout";
import { LocalizationProvider } from "@mui/x-date-pickers";
import NProgress from "nprogress";
import { NextPage } from "next";
import { Roboto } from "@next/font/google";
import { Router } from "next/router";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

export type AppPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: AppPageWithLayout;
  session: Session;
};

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function App({
  Component,
  session,
  pageProps,
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <div className={`${roboto.variable} font-sans`}>
      <SessionProvider
        session={session}
        refetchInterval={5 * 60} // 5 minutes
        refetchOnWindowFocus={true}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {getLayout(<Component {...pageProps} />)}
        </LocalizationProvider>
        <ToastContainer
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
        />
      </SessionProvider>
    </div>
  );
}
