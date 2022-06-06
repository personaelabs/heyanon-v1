import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../lib/components";
import { setupWeb3 } from "../lib/web3";
import styles from "../styles/Home.module.css";

// TODO: this is a page for creating proofs + sending with message
// UI 'steps':
// 0. connect metamask
// 1. generate proof
// 2. (creating proof)
// 3. submit proof + msg to server
// 4. verified! tweet coming soon

const getStep = (ethAddress: string | null) => {
  if (!ethAddress) return 0;

  // if no proof + not creating proof, return 1

  // if no proof + creating proof return 2

  // if proof exists but no submission yet return 3

  // else 4

  // TODO:
  // if (!zkProof) return 2;
  // if (!proofVerifiedInfo?.submitted) return 3;
  return 4;
};

const TITLES = [
  "Connect Metamask and select address",
  "Prove yourself",
  "Enter message",
];

const Home: NextPage = () => {
  const [metamaskAddress, setMetamaskAddress] = useState<string | null>(null);

  const connectToMetamask = () => {
    const connectToMetamaskAsync = async () => {
      const { provider, signer, network } = await setupWeb3();
      // console.log(provider, signer, network)
      const addr = await signer.getAddress();
      console.log(`Connected address: ${addr}`);
      setMetamaskAddress(addr);
    };
    connectToMetamaskAsync();
  };

  const step = getStep(metamaskAddress);

  return (
    <div className={styles.container}>
      <Head>
        <title>Prove Yourself</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {step == 0 && (
          <div>
            <p className={styles.description}>Choose DAO hack victim address</p>

            <Button onClick={connectToMetamask}>Connect Metamask</Button>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
