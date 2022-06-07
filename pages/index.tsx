import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../lib/components";
import { setupWeb3 } from "../lib/web3";
import styles from "../styles/Home.module.css";

import { merkleTree, addressInTree } from "../lib/merkleTree";

// TODO: this is a page for creating proofs + sending with message
// UI 'steps':
// 0. connect metamask
// 1. generate proof
// 2. (creating proof)
// 3. submit proof + msg to server
// 4. verified! tweet coming soon

// TODO: first testing with smaller proof, then test against the big guy...
const getStep = (ethAddress: string | null) => {
  if (!ethAddress || !addressInTree(ethAddress)) return 0;

  // if no proof + not creating proof, return 1

  // if no proof + creating proof return 2

  // if proof exists but no submission yet return 3

  // else 4

  return 1;
};

const Home: NextPage = () => {
  const [metamaskAddress, setMetamaskAddress] = useState<string>("");

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

  const generateProof = () => {
    // 1. get input
    // incl. getting signature!
    // 2. put input in generateProof
    // TODO: store proof somewhere
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
            {!metamaskAddress ? (
              <p className={styles.description}>
                Choose address for proof generation
              </p>
            ) : (
              <p className={styles.description}>Address not found!</p>
            )}

            <Button onClick={connectToMetamask}>Connect Metamask</Button>
          </div>
        )}

        {step == 1 && (
          <div>
            <p className={styles.description}>Generate proof</p>

            <Button onClick={generateProof}>Generate</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
