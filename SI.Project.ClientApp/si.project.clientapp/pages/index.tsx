import { Inter, Roboto } from "@next/font/google";
import { getSession, signIn, signOut, useSession } from "next-auth/react";

import Head from "next/head";
import Image from "next/image";
import forge from "node-forge";
import styles from "../styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data: session } = useSession();

  const generateCert = () => {
    const keyPair = forge.pki.rsa.generateKeyPair(2048);
    const pubKey = keyPair.publicKey;
    const privKey = keyPair.privateKey;

    const cert = forge.pki.createCertificate();
    cert.publicKey = pubKey;
    cert.privateKey = privKey;
    cert.serialNumber = "01";
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(
      cert.validity.notBefore.getFullYear() + 1
    );
    const attrs = [
      {
        name: "commonName",
        value: "example.org",
      },
      {
        name: "countryName",
        value: "US",
      },
      {
        shortName: "ST",
        value: "Virginia",
      },
      {
        name: "localityName",
        value: "Blacksburg",
      },
      {
        name: "organizationName",
        value: "Test",
      },
      {
        shortName: "OU",
        value: "Test",
      },
    ];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([
      {
        name: "basicConstraints",
        cA: true,
      },
      {
        name: "keyUsage",
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: "extKeyUsage",

        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true,
      },
      {
        name: "nsCertType",
        client: true,
        server: true,
        email: true,
        objsign: true,
        sslCA: true,
        emailCA: true,
        objCA: true,
      },
      // {
      //   name: "subjectAltName",
      // },
      // {
      //   name: "subjectKeyIdentifier",
      // },
    ]);
    cert.sign(privKey, forge.md.sha256.create());

    var pem = {
      privateKey: forge.pki.privateKeyToPem(keyPair.privateKey),
      publicKey: forge.pki.publicKeyToPem(keyPair.publicKey),
      certificate: forge.pki.certificateToPem(cert),
    };
    console.log(pem.privateKey);
    console.log(pem.publicKey);
    console.log(pem.certificate);
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            SI.Project.
            <code className={styles.code}>ClientApp</code>
          </p>
          <div>
            <a
              href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              By{" "}
              <Image
                src="/vercel.svg"
                alt="Vercel Logo"
                className={styles.vercelLogo}
                width={100}
                height={24}
                priority
              />
            </a>
          </div>
        </div>

        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <div className={styles.thirteen}>
            <Image
              src="/thirteen.svg"
              alt="13"
              width={40}
              height={31}
              priority
            />
          </div>
        </div>

        <div className="flex flex-col">
          {session ? (
            <div className="flex flex-col">
              <p>{JSON.stringify(session.user)}</p>
              <button onClick={() => signOut()}>Sign Out</button>
            </div>
          ) : (
            <div>
              <button onClick={() => signIn("identityServer")}>Sign In</button>
            </div>
          )}
        </div>

        <div>
          <button onClick={() => generateCert()}>Generate Cert</button>
        </div>

        <div className={styles.grid}>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Docs <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Find in-depth information about Next.js features and&nbsp;API.
            </p>
          </a>

          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Learn <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Learn about Next.js in an interactive course with&nbsp;quizzes!
            </p>
          </a>

          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Templates <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Discover and deploy boilerplate example Next.js&nbsp;projects.
            </p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Deploy <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Instantly deploy your Next.js site to a shareable URL
              with&nbsp;Vercel.
            </p>
          </a>
        </div>
      </main>
    </>
  );
}