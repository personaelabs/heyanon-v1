import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../lib/components";
import { setupWeb3 } from "../lib/web3";
import styles from "../styles/Home.module.css";

import { merkleTree, addressInTree } from "../lib/merkleTree";
import { buildInput, generateProof } from "../lib/frontend/zkp";

import { ethers } from "ethers";

// TODO: add state for proof generating in the background!
// NOTE: first testing with smaller, dummy proof, then test against the big guy...

const Home: NextPage = () => {
  const [signer, setSigner] = useState<any | null>(null);
  const [metamaskAddress, setMetamaskAddress] = useState<string>("");

  const [message, setMessage] = useState<string | null>(null);

  // TODO: msgHash, pubkey, etc.

  const [signature, setSignature] = useState<string | null>(null);

  const [proof, setProof] = useState(null);
  const [publicSignals, setPublicSignals] = useState(null);

  // TODO: also maybe store(/show) link to tweet?
  const [proofIpfs, setProofIpfs] = useState(null);

  const getStep = () => {
    if (metamaskAddress.length === 0 || !addressInTree(metamaskAddress))
      return 0;

    // TODO: remove
    return 1;

    if (!message || !signature) return 1;

    if (!proof || !publicSignals) return 2;

    if (!proofIpfs) return 3;

    return 4;
  };

  const connectToMetamask = () => {
    const connectToMetamaskAsync = async () => {
      const { provider, signer, network } = await setupWeb3();
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
      // NOTE: we can just use signMessage for a decent UX here!
      const signature = await signer.signMessage(message);
      console.log(`Signature: ${signature}`);
      setSignature(signature);

      // TODO: probably want to encapsulate this somewhere else?
      const msgHash = ethers.utils.hashMessage(message!);
      const msgHashBytes = ethers.utils.arrayify(msgHash);
      console.log(`Message hash: ${msgHash}`);

      const pubkey = ethers.utils.recoverPublicKey(msgHashBytes, signature);
      console.log(`Pubkey: ${pubkey}`);

      const recoveredAddress = ethers.utils.computeAddress(pubkey);
      const actualAddress = await signer.getAddress();

      if (recoveredAddress != actualAddress) {
        console.log(
          `Address mismatch on recovery! Recovered ${recoveredAddress} but signed with ${actualAddress}`
        );
      }
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
            <p className={styles.description}>Sign Message</p>

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
