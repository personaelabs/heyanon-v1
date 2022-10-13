import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Title, Button } from "../components/Base";
import Slideover from "../components/Slideover";
import { ClipLoader } from "react-spinners";
import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

import { generateSignalHash } from "../lib/semaphore";
import { generateProof, downloadProofFiles } from "../lib/zkp";
import { MerkleTree } from "../lib/merkleTree";
import { poseidon } from "circomlibjs";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";

import { HashedData, getGroupIdentities } from "../lib/tazUtils";

// tweet size minus verify message '\n\nheyanon.xyz/verify/IPFSHASH'
// chose 250 to be sure of no message overflows
const MAX_MESSAGE_LENGTH = 250 - 75;

enum Stage {
  CONNECTING = "Retreiving group",
  INVALIDART = "Invalid ID, reload in 2 min",
  GOTOTAZ = "Invalid URL, return to TAZ",
  SPELLTYPE = "Cast a spell",
  MESSAGE = "Post a tweet",
  REPLY = "Reply to any tweet",
  HP = "Harry Potter game",
  INPROGRESS = "Magic is happening",
  SUBMIT = "Spell complete!",
  SUCCESS = "Success!",
}

const PostMsgPage = () => {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>(Stage.CONNECTING);
  const [merkleTree, setMerkleTree] = useState<MerkleTree>();

  const [idc, setIdc] = useState<string>("");
  const [pubNullifier, setPubNullifier] = useState<string>("");
  const [zkIdentity, setZKIdentity] = useState<Identity | null>(null);

  const [msg, setMsg] = useState<string>("");
  const [msgType, setMsgType] = useState<"MESSAGE" | "REPLY">("MESSAGE");
  const [replyTweetId, setReplyTweetId] = useState<string | null>(null);
  const [submitPending, setSubmitPending] = useState<boolean>(false);

  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [proof, setProof] = useState(null);
  const [publicSignals, setPublicSignals] = useState(null);

  const [slideoverOpen, setSlideoverOpen] = useState<boolean>(false);
  const [slideoverContent, setSlideoverContent] = useState<any | null>(null);
  const [slideoverTitle, setSlideoverTitle] = useState<string>("");

  const [proofIpfs, setProofIpfs] = useState(null);
  const [tweetLink, setTweetLink] = useState(null);

  useEffect(() => {
    async function getMerkleTree() {
      // get our metadata
      const resp = await fetch(`/api/trees/taz`);
      const respData: MerkleTree = await resp.json();

      // get subgraph group
      let members = await getGroupIdentities();
      let groupObj = new Group(16);
      groupObj.addMembers(members);
      for (const member of members) {
        const merkleProof = groupObj.generateProofOfMembership(
          groupObj.indexOf(BigInt(member))
        );
        respData.leafToPathElements[member] = merkleProof.siblings.map((el) =>
          el.toString()
        );
        respData.leafToPathIndices[member] = merkleProof.pathIndices.map((el) =>
          el.toString()
        );
      }

      // get identity
      let serializedIdentity;
      if (window.location.hash.length !== 0) {
        if (window.location.hash.slice(1).split("_").length !== 2) {
          setStage(Stage.GOTOTAZ);
          return;
        }
        const [nullifier, trapdoor] = window.location.hash.slice(1).split("_");
        serializedIdentity = JSON.stringify([nullifier, trapdoor]);
      } else {
        if (localStorage.getItem("serializedIdentity") === null) {
          setStage(Stage.GOTOTAZ);
          return;
        }
        serializedIdentity = localStorage.getItem("serializedIdentity");
      }

      const identityObj = new Identity(serializedIdentity!);
      const artifactIdc = identityObj.generateCommitment().toString();
      const artifactPubNullifier = poseidon([
        respData.ext_nullifier,
        identityObj.getNullifier(),
      ]).toString();

      if (!(artifactIdc.toString() in respData.leafToPathElements)) {
        setStage(Stage.INVALIDART);
        return;
      }

      setZKIdentity(identityObj);
      localStorage.setItem("serializedIdentity", serializedIdentity!);
      router.push("/taz", undefined, { shallow: true });

      setMerkleTree(respData);
      setIdc(artifactIdc);
      setPubNullifier(artifactPubNullifier);
      setStage(Stage.SPELLTYPE);
    }
    getMerkleTree();
  }, []);

  const parseReplyId = (replyTweetLink: string) => {
    setReplyTweetId(null);
    const linkRegex = /.*twitter.com\/.*\/(\d*)/g;
    const matches = linkRegex.exec(replyTweetLink);
    if (!matches) {
      return;
    }
    setReplyTweetId(matches[1]);
  };

  const castMessage = () => {
    const genProofAsync = async () => {
      if (!merkleTree) {
        return;
      }

      const hashedData: HashedData = {
        msg,
        replyTweetId,
        pubNullifier,
        msgType,
      };

      const input = {
        identityTrapdoor: zkIdentity!.getTrapdoor().toString(),
        identityNullifier: zkIdentity!.getNullifier().toString(),
        treePathIndices: merkleTree.leafToPathIndices[idc],
        treeSiblings: merkleTree.leafToPathElements[idc],
        externalNullifier: merkleTree.ext_nullifier,
        signalHash: generateSignalHash(JSON.stringify(hashedData)).toString(),
      };

      setStage(Stage.INPROGRESS);

      setLoadingMessage("Gathering equipment");
      await downloadProofFiles(merkleTree.proof);

      setLoadingMessage("Using your wand");
      const { proof, publicSignals } = await generateProof(
        input,
        merkleTree.proof
      );

      setProof(proof);
      setPublicSignals(publicSignals);

      setStage(Stage.SUBMIT);
    };

    genProofAsync();
  };

  const submit = async () => {
    setSubmitPending(true);
    const hashedData = {
      msg,
      replyTweetId,
      pubNullifier,
      msgType,
    };

    const resp = await fetch("/api/taz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        proof,
        publicSignals,
        hashedData,
      }),
    });

    const respData = await resp.json();
    setProofIpfs(respData["ipfsHash"]);
    setTweetLink(respData["tweetURL"]);
    setStage(Stage.SUCCESS);
    setSubmitPending(false);
  };

  const openSlideOver = (slideoverContent: any, title: string) => {
    setSlideoverTitle(title);
    setSlideoverContent(slideoverContent);
    setSlideoverOpen(true);
  };

  return (
    <>
      <div className="h-screen">
        <Head>
          <title>heyanon!</title>
          <link rel="icon" href="/heyanon.ico" />
          <script async src="snarkjs.min.js"></script>
        </Head>

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
            />
          )}
        </Slideover>

        <div className="flex h-full items-center justify-center bg-heyanonyellow text-white">
          <div className="prose max-w-prose">
            {stage !== Stage.INPROGRESS ? (
              <div className="flex justify-center pt-10">
                <Image
                  src="/logo.svg"
                  alt="heyanon!"
                  width="174"
                  height="120"
                />
              </div>
            ) : (
              <div className="flex justify-center">
                <Image
                  src="/logo_loading.gif"
                  alt="heyanon!"
                  width="220"
                  height="220"
                />
              </div>
            )}

            <div className="px-8">
              <div className="flex justify-center text-center">
                <Title> {stage} </Title>
              </div>

              <div className="mb-5">
                {stage === Stage.SPELLTYPE && (
                  <div className="flex flex-col justify-center text-center">
                    <Button className="mb-5">
                      <a
                        href={`https://twitter.com/DevconAnon`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "black",
                        }}
                      >
                        View feed
                      </a>
                    </Button>

                    <Button
                      className="mb-5"
                      onClick={() => {
                        setStage(Stage.MESSAGE);
                        setMsgType("MESSAGE");
                      }}
                    >
                      Post
                    </Button>
                    <Button
                      className="mb-5"
                      onClick={() => {
                        setStage(Stage.REPLY);
                        setMsgType("REPLY");
                      }}
                    >
                      Reply
                    </Button>
                    <Button
                      className="mb-5"
                      onClick={() => {
                        setStage(Stage.HP);
                      }}
                    >
                      Harry Potter sign-up
                    </Button>

                    <div className="mt-2">
                      <a
                        style={{
                          color: "red",
                        }}
                        href="https://personaelabs.org/posts/sbcheyanon/#:~:text=Highlighting%20the-,magic,-of%20ZK"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Why do we use magical terms?
                      </a>
                    </div>
                  </div>
                )}
                {stage === Stage.MESSAGE && (
                  <div className="">
                    <textarea
                      rows={4}
                      name="comment"
                      id="comment"
                      className="block w-full resize-none rounded-md border-gray-300 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm	p-5"
                      placeholder={"Enter here..."}
                      onChange={(e) => setMsg(e.target.value)}
                    />
                  </div>
                )}
                {stage === Stage.REPLY && (
                  <div className="">
                    <textarea
                      rows={1}
                      name="replyId"
                      id="replyId"
                      className="block w-full resize-none rounded-md border-gray-300 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm	p-5 mb-5 whitespace-nowrap"
                      placeholder={"Paste full tweet link..."}
                      onChange={(e) => parseReplyId(e.target.value)}
                    />
                    <textarea
                      rows={4}
                      name="comment"
                      id="comment"
                      className="block w-full resize-none rounded-md border-gray-300 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm	p-5"
                      placeholder={"Message here..."}
                      onChange={(e) => setMsg(e.target.value)}
                    />
                  </div>
                )}
                {stage === Stage.HP && (
                  <div className="flex flex-col justify-center text-center">
                    <div className="mb-4">
                      Due to other Personae commitments, we have decided to
                      cancel this game.
                    </div>
                    <div className="mb-4">
                      It will return at another conference!
                    </div>
                  </div>
                )}
                {stage === Stage.INPROGRESS && (
                  <div className="flex justify-center text-center">
                    <span> {`${loadingMessage}`} </span>
                    <div className="pl-2">
                      <ClipLoader color={"black"} loading={true} size={15} />
                    </div>
                  </div>
                )}
                {stage === Stage.SUBMIT && (
                  <div className="flex justify-center text-center">
                    <span
                      onClick={() => openSlideOver(proof, "Spell result")}
                      className="hover:cursor-pointer hover:text-terminal-green"
                    >
                      <u>View the result</u>
                    </span>
                  </div>
                )}
                {stage === Stage.SUCCESS && (
                  <div className="flex flex-col justify-center text-center">
                    <div className="mb-2">
                      <a
                        href={`${tweetLink}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "red",
                        }}
                      >
                        <u>Link to tweet</u>
                      </a>
                    </div>
                    <div className="mb-2">
                      Join our{" "}
                      <a
                        href={"https://discord.gg/kmKAC5T6sV"}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "red",
                        }}
                      >
                        <u>discord!</u>
                      </a>
                    </div>
                    <div>
                      <a
                        href={`https://heyanon.xyz/taz`}
                        style={{
                          color: "red",
                        }}
                      >
                        <u>Post again!</u>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center py-2">
                {stage === Stage.MESSAGE && (
                  <>
                    <Button
                      disabled={
                        msg === null ||
                        msg.length === 0 ||
                        msg.length > MAX_MESSAGE_LENGTH
                      }
                      onClick={castMessage}
                      className="disabled:opacity-50 mr-5"
                    >
                      {(msg ? msg.length : 0) > MAX_MESSAGE_LENGTH
                        ? "Message too long"
                        : "Cast spell"}
                    </Button>
                    <Button
                      onClick={() => setStage(Stage.SPELLTYPE)}
                      className="disabled:opacity-50"
                    >
                      Back
                    </Button>
                  </>
                )}

                {stage === Stage.REPLY && (
                  <>
                    <Button
                      disabled={
                        msg === null ||
                        msg.length === 0 ||
                        msg.length > MAX_MESSAGE_LENGTH ||
                        replyTweetId === null
                      }
                      onClick={castMessage}
                      className="disabled:opacity-50 mr-5"
                    >
                      {(msg ? msg.length : 0) > MAX_MESSAGE_LENGTH
                        ? "Message too long"
                        : "Cast spell"}
                    </Button>
                    <Button
                      onClick={() => setStage(Stage.SPELLTYPE)}
                      className="disabled:opacity-50"
                    >
                      Back
                    </Button>
                  </>
                )}

                {stage === Stage.HP && (
                  <Button onClick={() => setStage(Stage.SPELLTYPE)}>
                    Back
                  </Button>
                )}

                {stage === Stage.SUBMIT && (
                  <Button disabled={submitPending} onClick={submit}>
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostMsgPage;
