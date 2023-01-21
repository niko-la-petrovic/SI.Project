import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
} from "@mui/material";
import {
  MdBiotech,
  MdClose,
  MdDashboard,
  MdLogin,
  MdMenu,
} from "react-icons/md";
import { signIn, signOut, useSession } from "next-auth/react";
import { useContext, useState } from "react";

import Avvvatars from "avvvatars-react";
import { CertStoreContext } from "../../store/cert-store";
import { FcAbout } from "react-icons/fc";
import Image from "next/image";
import Link from "next/link";
import Title from "../molecules/title";
import forge from "node-forge";

export default function Header({
  drawerOpen,
  setDrawerOpen,
}: {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const { state: certStore, dispatch: certStoreDispatch } =
    useContext(CertStoreContext);

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  return (
    <div>
      <div className="hidden md:flex justify-between items-center px-8 py-4 shadow-xl">
        <nav className="flex items-center gap-x-6">
          <Title />
          <Link href="/">
            <span>Home</span>
          </Link>
          <Link href="/account">
            <span>Account</span>
          </Link>
          <Link href="/advanced">
            <span>Advanced</span>
          </Link>
          <Link href="/users">
            <span>Users</span>
          </Link>
        </nav>
        <div className="flex items-center justify-start gap-4 ">
          {session ? (
            <>
              {certStore.publicKey && (
                <div className="relative">
                  <Avvvatars
                    value={forge.pki
                      .getPublicKeyFingerprint(certStore.publicKey)
                      .toHex()}
                    shadow
                    style="shape"
                  />
                </div>
              )}
              <span className="text-lg font-bold">{session?.user?.name}</span>
              <Button variant="contained" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <div>
              <Button
                variant="contained"
                onClick={() => signIn("identityServer")}
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="md:hidden flex p-4">
        <div>
          <Button variant="contained" onClick={() => setDrawerOpen(true)}>
            <MdMenu className="text-3xl" />
          </Button>
        </div>
      </div>
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
      >
        <div className="flex flex-col gap-y-4 p-4">
          <div>
            <Button variant="contained" onClick={() => setDrawerOpen(false)}>
              <MdClose className="text-3xl" />
            </Button>
          </div>
          {/* TODO use response app bar with drawer */}
          {/* https://mui.com/material-ui/react-app-bar/#responsive-app-bar-with-drawer */}
          {/* TODO adjust links */}
          <List>
            {[
              { text: "Početna", icon: <MdDashboard />, href: "/" },
              {
                text: "Mikroskopiranje",
                icon: <MdBiotech />,
                href: "/samples",
              },
              { text: "Prijava", icon: <MdLogin />, href: "/login" },
              {
                text: "O nama",
                icon: <FcAbout />,
                href: "/about",
              },
            ].map((menuItem, index) => (
              <ListItem key={index} disablePadding>
                <Link href={menuItem.href} onClick={() => setDrawerOpen(false)}>
                  <ListItemButton>
                    <ListItemIcon className="text-2xl text-black">
                      {menuItem.icon}
                    </ListItemIcon>
                    <ListItemText primary={menuItem.text} />
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
          </List>
        </div>
      </SwipeableDrawer>
    </div>
  );
}
