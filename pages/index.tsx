import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../lib/components";
import { setupWeb3 } from "../lib/web3";
import styles from "../styles/Home.module.css";

import { merkleTree, addressInTree } from "../lib/merkleTree";
import { buildInput, generateProof } from "../lib/frontend/zkp";

// TODO: add state for proof generating in the background!
// NOTE: first testing with smaller, dummy proof, then test against the big guy...

const Home: NextPage = () => {
  const [signer, setSigner] = useState<any | null>(null);
  const [metamaskAddress, setMetamaskAddress] = useState<string>("");

  const [message, setMessage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const [proof, setProof] = useState(null);
  const [publicSignals, setPublicSignals] = useState(null);

  // TODO: also maybe store(/show) link to tweet?
  const [proofIpfs, setProofIpfs] = useState(null);

  const getStep = () => {
    if (metamaskAddress.length === 0 || !addressInTree(metamaskAddress))
      return 0;

    if (!message || !signature) return 1;

    if (!proof || !publicSignals) return 2;

    if (!proofIpfs) return 3;

    return 4;
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

  const genProof = () => {
    const genProofAsync = async () => {
      const input = buildInput(metamaskAddress, signature);
      const { proof, publicSignals } = await generateProof(input);

      setProof(proof);
      setPublicSignals(publicSignals);
    };

    genProofAsync();
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

  const submit = async () => {
    const resp = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        proof,
        publicSignals,
        message,
      }),
    });
    console.log(resp);
  };

  const step = getStep();

  return (
    <div className={styles.container}>
      <Head>
        <title>Prove Yourself</title>
        <link rel="icon" href="/favicon.ico" />

        <script async src="snarkjs.min.js"></script>
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
            {/* TODO: validate tweet + ipfs hash < tweet limit */}
            <p className={styles.description}>Submit Message</p>

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

            <Button onClick={genProof}>Generate</Button>
          </div>
        )}

        {step == 3 && (
          <div>
            <p className={styles.description}>Submit Proof and Message</p>

            <p>
              Message - <strong>{message}</strong>
            </p>

            <p>TODO: display proof json as well</p>
            {/* TODO: display proof too */}

            <Button onClick={submit}>Submit</Button>
          </div>
        )}

        {step == 4 && (
          <div>
            <p className={styles.description}>Message posted successfully!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
