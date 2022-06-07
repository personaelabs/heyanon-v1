import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../lib/components";
import { setupWeb3 } from "../lib/web3";
import styles from "../styles/Home.module.css";

import { merkleTree, addressInTree } from "../lib/merkleTree";
import { buildInput } from "../lib/frontend/zkp";

// TODO: this is a page for creating proofs + sending with message
// UI 'steps':
// 0. connect metamask
// 1. sign data!
// 1. generate proof
// 2. (creating proof)
// 3. submit proof + msg to server
// 4. verified!

// TODO: first testing with smaller proof, then test against the big guy...

const Home: NextPage = () => {
  const [signer, setSigner] = useState<any | null>(null);
  const [metamaskAddress, setMetamaskAddress] = useState<string>("");

  const [message, setMessage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const getStep = () => {
    if (!metamaskAddress || !addressInTree(metamaskAddress)) return 0;

    if (!message || !signature) return 1;

    return 2;
  };

  const connectToMetamask = () => {
    const connectToMetamaskAsync = async () => {
      const { provider, signer, network } = await setupWeb3();
      // console.log(provider, signer, network)
      setSigner(signer);
      const addr = await signer.getAddress();
      console.log(`Connected address: ${addr}`);
      setMetamaskAddress(addr);
    };
    connectToMetamaskAsync();
  };

  const generateProof = () => {
    const input = buildInput(metamaskAddress);
    // 1. gen input
    // 2. put input in generateProof
    // 3. store proof in state
  };

  const signMessage = () => {
    const signMessageAsync = async () => {
      const domain = {
        name: "dao hack gossip",
        version: "1",
        chainId: 1,
      };
      const types = {
        Message: [{ name: "message", type: "string" }],
      };
      const value = {
        message,
      };

      const signature = await signer._signTypedData(domain, types, value);
      setSignature(signature);
    };

    signMessageAsync();
  };

  const step = getStep();

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
            <p className={styles.description}>Sign your message</p>

            <input
              type="text"
              name="message"
              onChange={(e) => setMessage(e.target.value)}
            ></input>
            <Button
              disabled={message === null || message.length === 0}
              onClick={signMessage}
            >
              Sign
            </Button>
          </div>
        )}

        {step == 2 && (
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
