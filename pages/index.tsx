import type { NextPage } from "next";
import Head from "next/head";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ethers } from "ethers";
import { ClipLoader } from "react-spinners";
import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

import { setupWeb3 } from "../lib/web3";
import { merkleTree, addressInTree } from "../lib/merkleTree";
import {
  buildInput,
  generateProof,
  downloadProofFiles,
} from "../lib/frontend/zkp";

import { Wrapper, Stepper, Title, Button } from "../components/Base";
import Tooltip from "../components/Tooltip";
import InfoRow from "../components/InfoRow";
import SubmitButton from "../components/SubmitButton";
import Slideover from "../components/Slideover";
import LoadingText from "../components/LoadingText";
import { UploadIcon } from "@heroicons/react/solid";
import Header from "../components/Header";

// TODO: add state for proof generating in the background!
// NOTE: first testing with smaller, dummy proof, then test against the big guy...

const MAX_MESSAGE_LENGTH = 280 - (46 + 8); // tweet size minus ipfs hash length and '\nipfs()'

const TITLES = [
  "Please connect with Metamask",
  "Change to a valid address",
  "Please confirm address",
  "Enter your tweet & sign",
  "Start generating a ZK proof",
  "Proof is being generated",
  "Submit proof and message",
  "Message has been posted!",
];

const Home: NextPage = () => {
  const [signer, setSigner] = useState<any | null>(null);
  const [address, setAddress] = useState<string>("");
  const [confirmAddress, setConfirmAddress] = useState<boolean>(false);

  const [msg, setMsg] = useState<string>("");
  const [sig, setSig] = useState<string>("");
  const [msghash, setMsghash] = useState<string>("");
  const [pubkey, setPubkey] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [slideoverOpen, setSlideoverOpen] = useState<boolean>(false);
  const [slideoverContent, setSlideroverContent] = useState<any | null>(null);
  const [slideoverTitle, setSlideoverTitle] = useState<string>("");

  const [group, setGroup] = useState<string>("DAO Hack");
  const [proof, setProof] = useState(null);
  const [publicSignals, setPublicSignals] = useState(null);

  const [proofIpfs, setProofIpfs] = useState(null);
  const [tweetLink, setTweetLink] = useState(null);

  const getStep = () => {
    if (address.length === 0) return 0;

    if (address.length !== 0 && !addressInTree(address)) return 1;

    if (!confirmAddress && address.length !== 0 && addressInTree(address))
      return 2;

    if (msg.length === 0 || sig.length === 0) return 3;

    if (!proof || !publicSignals) {
      if (loadingMessage.length === 0) return 4;

      return 5;
    }

    if (!proofIpfs) return 6;

    return 7;
  };

  const getExternalStep = (step: number) => {
    if (step === 0 || step === 1) return 0;
    else return step - 1;
  };

  const openSlideOver = (slideoverContent: any, title: string) => {
    setSlideoverTitle(title);
    setSlideroverContent(slideoverContent);
    setSlideoverOpen(true);
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

      setLoadingMessage("Downloading proving key...");
      await downloadProofFiles(filename);

      setLoadingMessage("Generating proof...");
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
    const respData = await resp.json();
    setProofIpfs(respData["ipfsHash"]);
    setTweetLink(respData["tweetURL"]);
  };

  const step = getStep();
  const externalStep = getExternalStep(step);

  return (
    <>
      <div className="h-screen">
        <Header></Header>

        <div className="-mt-24 flex h-full items-center justify-center bg-heyanonred p-20 text-white">
          <Slideover
            open={slideoverOpen}
            setOpen={setSlideoverOpen}
            title={slideoverTitle}
          >
            {slideoverContent && (
              <DynamicReactJson
                src={slideoverContent}
                name={null}
                indentWidth={2}
                displayDataTypes={false}
                displayArrayKey={false}
              />
            )}
          </Slideover>

          <div className="items-center justify-center	self-center">
            <div className="flex justify-between">
              <Stepper>ZK Verification STEP {externalStep}/6</Stepper>
              <div className="flex items-center justify-center px-2">
                <span className="p-2">
                  <UploadIcon width={16} height={16} />
                </span>
                <Link href={`/`}>
                  <a className="text-s hover:text-gray-400">
                    {"Upload Local Proof"}
                  </a>
                </Link>
              </div>
            </div>

            {step < 8 && <Title> {TITLES[step]} </Title>}

            <div className="my-5">
              {(step === 0 || step === 1 || step === 2) && (
                <>
                  <InfoRow name="Group" content={`${group}`} />
                  <InfoRow name="Merkle root" content={`${merkleTree.root}`} />
                </>
              )}
              {(step === 1 || step === 2) && (
                <InfoRow name="Address" content={`${address}`} />
              )}
              {step === 3 && (
                <div className="">
                  <textarea
                    rows={4}
                    name="comment"
                    id="comment"
                    className="block w-full resize-none rounded-md border-gray-300 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm	p-5"
                    placeholder={"Enter tweet..."}
                    onChange={(e) => setMsg(e.target.value)}
                  />
                </div>
              )}
              {step === 4 && (
                <>
                  <InfoRow name="Group" content={`${group}`} />
                  <InfoRow name="Merkle root" content={`${merkleTree.root}`} />
                  <InfoRow name="Address" content={`${address}`} />
                  <InfoRow name="Message" content={`${msg}`} />
                </>
              )}
              {step === 5 && (
                <div className="flex">
                  <div className="pr-2">
                    <ClipLoader color={"black"} loading={true} size={20} />
                  </div>
                  <InfoRow name="Currently" content={`${loadingMessage}`} />
                </div>
              )}
              {step === 6 && (
                <InfoRow
                  name="ZK Proof"
                  content={
                    <span
                      onClick={() => openSlideOver(proof, "ZK Proof")}
                      className="hover:cursor-pointer hover:text-terminal-green"
                    >
                      Click to view
                    </span>
                  }
                />
              )}
              {step === 7 && (
                <>
                  <InfoRow
                    name="Link to tweet"
                    content={<a href={`${tweetLink}`}>{`${tweetLink}`}</a>}
                  />
                  <InfoRow name="IPFS Hash" content={`${proofIpfs}`} />
                </>
              )}
            </div>

            <div className="py-2">
              {(step === 0 || step === 1) && (
                <Button onClick={connectToMetamask}>Connect Metamask</Button>
              )}
              {step === 2 && (
                <Button onClick={() => setConfirmAddress(true)}>
                  Confirm Address
                </Button>
              )}
              {step === 3 && (
                <Button
                  disabled={
                    msg === null ||
                    msg.length === 0 ||
                    msg.length > MAX_MESSAGE_LENGTH
                  }
                  onClick={signMessage}
                  className="disabled:opacity-50"
                >
                  {msg.length > MAX_MESSAGE_LENGTH
                    ? "Message too long"
                    : "Sign"}
                </Button>
              )}
              {step === 4 && <Button onClick={genProof}>Generate</Button>}
              {step === 6 && <Button onClick={submit}>Submit</Button>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
