import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { Button, ErrorMsg, LoadingGroup } from "../lib/components";
import { setupWeb3 } from "../lib/web3";
import styles from "../styles/Home.module.css";

import { addressInTree } from "../lib/merkleTree";
import {
  buildInput,
  generateProof,
  downloadProofFiles,
} from "../lib/frontend/zkp";

import { ethers } from "ethers";
import { ClipLoader } from "react-spinners";

// TODO: add state for proof generating in the background!
// NOTE: first testing with smaller, dummy proof, then test against the big guy...

const MAX_MESSAGE_LENGTH = 280 - (46 + 8); // tweet size minus ipfs hash length and '\nipfs()'

const Home: NextPage = () => {
  const [signer, setSigner] = useState<any | null>(null);
  const [address, setAddress] = useState<string>("");

  const [msg, setMsg] = useState<string>("");

  const [sig, setSig] = useState<string>("");
  const [msghash, setMsghash] = useState<string>("");
  const [pubkey, setPubkey] = useState<string>("");

  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const [proof, setProof] = useState(null);
  const [publicSignals, setPublicSignals] = useState(null);

  // TODO: also maybe store(/show) link to tweet?
  const [proofIpfs, setProofIpfs] = useState(null);

  const getStep = () => {
    if (address.length === 0 || !addressInTree(address)) return 0;

    if (msg.length === 0 || sig.length === 0) return 1;

    if (!proof || !publicSignals) return 2;

    if (loadingMessage.length > 0) return 3;

    if (!proofIpfs) return 4;

    return 5;
  };

  const connectToMetamask = () => {
    const connectToMetamaskAsync = async () => {
      const { provider, signer, network } = await setupWeb3();
      setSigner(signer);
      const addr = await signer.getAddress();
      console.log(`Connected address: ${addr}`);
      setAddress(addr);
    };
    connectToMetamaskAsync();
  };

  const genProof = () => {
    let filename = "group_message_64_4_7";

    const genProofAsync = async () => {
      const input = buildInput(address, pubkey, msghash, sig);
      console.log(
        JSON.stringify(
          input,
          (k, v) => (typeof v == "bigint" ? v.toString() : v),
          2
        )
      );

      console.log("Downloading files");
      setLoadingMessage("downloading proving key...");
      await downloadProofFiles(filename);

      console.log("Generating proof");
      setLoadingMessage("generating proof...");
      const { proof, publicSignals } = await generateProof(input, filename);

      setProof(proof);
      setPublicSignals(publicSignals);
    };

    genProofAsync();
  };

  const signMessage = () => {
    const signMessageAsync = async () => {
      const signature = await signer.signMessage(msg);
      console.log(`sig: ${signature}`);
      setSig(signature);

      const msgHash = ethers.utils.hashMessage(msg!);
      const msgHashBytes = ethers.utils.arrayify(msgHash);
      console.log(`msghash: ${msgHash}`);
      setMsghash(msgHash);

      const pubkey = ethers.utils.recoverPublicKey(msgHashBytes, signature);
      console.log(`pk: ${pubkey}`);
      setPubkey(pubkey);

      // NOTE: this check not *strictly* necessary, but no harm
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
        message: msg,
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
            {!address ? (
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
            <p className={styles.description}>Sign Message</p>
            <div>
              <input
                type="text"
                name="message"
                onChange={(e) => setMsg(e.target.value)}
              ></input>
            </div>
            {msg.length > MAX_MESSAGE_LENGTH && (
              <ErrorMsg>message too long!</ErrorMsg>
            )}
            <Button
              disabled={
                msg === null ||
                msg.length === 0 ||
                msg.length > MAX_MESSAGE_LENGTH
              }
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
          <LoadingGroup>
            <ClipLoader color={"#D8801F"} loading={true} size={60} />

            <p>{loadingMessage}</p>
          </LoadingGroup>
        )}

        {step == 4 && (
          <div>
            <p className={styles.description}>Submit Proof and Message</p>

            <p>
              Message - <strong>{msg}</strong>
            </p>

            <p>TODO: display proof json as well</p>
            {/* TODO: display proof too */}

            <Button onClick={submit}>Submit</Button>
          </div>
        )}

        {step == 5 && (
          <div>
            <p className={styles.description}>Message posted successfully!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
