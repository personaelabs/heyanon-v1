import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Title, Button } from "../../components/Base";
import Slideover from "../../components/Slideover";
import { ClipLoader } from "react-spinners";
import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

import { generateSignalHash } from "../../lib/semaphore";
import { downloadProofFiles } from "../../lib/zkp";
import { generateProof } from "../../lib/zkp.snarkjs";
import { MerkleTree } from "../../lib/merkleTree";
import { Identity } from "@semaphore-protocol/identity";
import { poseidon } from "circomlibjs";

import { HashedData, reputationToRoleText } from "../../lib/sbcUtils";

// tweet size minus ipfs hash length, '\n\nheyanon.xyz/verify/', and '#XXXX '
// chose 250 to be sure of no message overflows
const MAX_MESSAGE_LENGTH = 250 - 75 - 6;

enum Stage {
  CONNECTING = "Retreiving group",
  INVALIDART = "Invalid artifact :(",
  SPELLTYPE = "Cast a spell",
  MESSAGE = "Post a message",
  REPLY = "Reply to a message",
  UPVOTE = "Upvote a message",
  INPROGRESS = "Magic is happening",
  SUBMIT = "Spell complete!",
  SUCCESS = "Success!",
}

const PostMsgPage = () => {
  const router = useRouter();
  const { artifact } = router.query;

  const [stage, setStage] = useState<Stage>(Stage.CONNECTING);
  const [merkleTree, setMerkleTree] = useState<MerkleTree>();

  const [idc, setIdc] = useState<string>("");
  const [reputation, setReputation] = useState<number>(0);
  const [pubNullifier, setPubNullifier] = useState<string>("");
  const [tweetFooter, setTweetFooter] = useState<string>("");

  const [msg, setMsg] = useState<string>("");
  const [msgType, setMsgType] = useState<"MESSAGE" | "REPLY" | "UPVOTE">(
    "MESSAGE"
  );
  const [replyId, setReplyId] = useState<string | null>(null);

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
      if (!artifact) {
        return;
      }

      const resp = await fetch(`/api/trees/sbc`);
      const respData: MerkleTree = await resp.json();

      const artifactIdc = new Identity(artifact.toString())
        .generateCommitment()
        .toString();
      const artifactPubNullifier = poseidon([
        respData.ext_nullifier,
        new Identity(artifact.toString()).getNullifier(),
      ]).toString();

      if (!(artifactIdc in respData.leafToPathElements)) {
        setStage(Stage.INVALIDART);
        return;
      }

      setMerkleTree(respData);
      setIdc(artifactIdc);
      setPubNullifier(artifactPubNullifier);
      setStage(Stage.SPELLTYPE);

      let nullifierRep: number = 0;
      for (const nullifier of respData.nullifiers) {
        if (nullifier.value === artifactPubNullifier) {
          nullifierRep = nullifier.reputation!;
        }
      }
      setReputation(nullifierRep);
      setTweetFooter(`, says ${reputationToRoleText(nullifierRep)}.`);
    }
    getMerkleTree();
  }, [artifact]);

  const castMessage = () => {
    const genProofAsync = async () => {
      if (!merkleTree) {
        return;
      }

      const userId = new Identity(artifact!.toString());

      const hashedData: HashedData = {
        msg,
        replyId,
        pubNullifier,
        msgType,
      };

      const input = {
        identityTrapdoor: userId.getTrapdoor().toString(),
        identityNullifier: userId.getNullifier().toString(),
        treePathIndices: merkleTree.leafToPathIndices[idc],
        treeSiblings: merkleTree.leafToPathElements[idc],
        externalNullifier: merkleTree.ext_nullifier,
        signalHash: generateSignalHash(JSON.stringify(hashedData)).toString(),
      };

      console.log("Proof inputs:");
      console.log(input);

      setStage(Stage.INPROGRESS);

      setLoadingMessage("Gathering equipment");
      await downloadProofFiles(merkleTree.proof);

      setLoadingMessage("Using your artifact");
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
    const hashedData = {
      msg,
      replyId,
      pubNullifier,
      msgType,
    };

    // const resp = await fetch("/api/magic", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     proof,
    //     publicSignals,
    //     hashedData,
    //   }),
    // });

    // const respData = await resp.json();
    // setProofIpfs(respData["ipfsHash"]);
    // setTweetLink(respData["tweetURL"]);

    setStage(Stage.SUCCESS);
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

        <div className="flex h-full items-center justify-center bg-heyanonpurple text-white">
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
                        href={`https://twitter.com/TheZKGuild`}
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
                        setStage(Stage.UPVOTE);
                        setMsgType("UPVOTE");
                        setMsg("This is a good post!");
                      }}
                    >
                      Upvote
                    </Button>

                    <div>
                      Casting as <u>{reputationToRoleText(reputation)}</u>
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
                      className="block w-full resize-none rounded-md border-gray-300 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm	p-5 mb-5"
                      placeholder={"Replied message #.."}
                      onChange={(e) => setReplyId(e.target.value)}
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
                {stage === Stage.UPVOTE && (
                  <div className="">
                    <textarea
                      rows={1}
                      name="replyId"
                      id="replyId"
                      className="block w-full resize-none rounded-md border-gray-300 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm	p-5 mb-5"
                      placeholder={"Upvoted message #..."}
                      onChange={(e) => setReplyId(e.target.value)}
                    />
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
                      <a href={`${tweetLink}`} target="_blank" rel="noreferrer">
                        <u>Link to tweet</u>
                      </a>
                    </div>
                    <div className="mb-2">
                      Join our{" "}
                      <a
                        href={"https://discord.gg/kmKAC5T6sV"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <u>discord!</u>
                      </a>
                    </div>
                    <div>
                      <a href={`https://heyanon.xyz/magic/${artifact}`}>
                        <u>Post again!</u>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center py-2">
                {[Stage.MESSAGE, Stage.REPLY, Stage.UPVOTE].indexOf(stage) !==
                  -1 && (
                  <Button
                    disabled={
                      msg === null ||
                      msg.length === 0 ||
                      msg.length > MAX_MESSAGE_LENGTH
                    }
                    onClick={castMessage}
                    className="disabled:opacity-50"
                  >
                    {(msg ? msg.length : 0) + tweetFooter.length >
                    MAX_MESSAGE_LENGTH
                      ? "Message too long"
                      : "Cast spell"}
                  </Button>
                )}
                {stage === Stage.SUBMIT && (
                  <Button disabled={true}>Submit</Button>
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
