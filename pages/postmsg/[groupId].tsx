import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { SetStateAction, useEffect, useState } from "react";
import { ethers } from "ethers";

import { Title, Button } from "../../components/Base";
import { InfoTooltip, Tooltip } from "../../components/Tooltip";
import InfoRow from "../../components/InfoRow";
import Slideover from "../../components/Slideover";
import LoadingText from "../../components/LoadingText";
import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

import { setupWeb3, userConnectToMetamask } from "../../lib/frontend/web3";
import { eip712MsgHash, eip712Sign, EIP712Value } from "../../lib/hashing";
import { buildInput, generateProof, downloadProofFiles } from "../../lib/zkp";
import { MerkleTree, treeFromCloudfront } from "../../lib/merkleTree";

// tweet size minus ipfs hash length and '\n\nheyanon.xyz/verify/'
const MAX_MESSAGE_LENGTH = 280 - 75;

export enum Stage {
  CONNECTING = "Retreiving group",
  INVALID = "Invalid group :(",
  WALLET = "Connect with Metamask",
  NEWADDRESS = "Invalid address, please change",
  MSGTYPE = "Select message type",
  TWEET = "Enter your tweet & sign",
  GENERATE = "Generate a ZK proof",
  INPROGRESS = "Proof is being generated",
  SUBMIT = "Submit proof and message",
  PENDING = "Message has been submitted for approval",
  SUCCESS = "Message has been posted!",
}

const PostMsgPage = () => {
  const router = useRouter();
  const { groupId } = router.query;

  const [ isModerated, setIsModerated ] = useState(false);
  const [ stage, setStage ] = useState<Stage>(Stage.CONNECTING);
  const [ merkleTree, setMerkleTree ] = useState<MerkleTree>();
  const [ root, setRoot ] = useState<string>("");
  const [ groupName, setGroupName ] = useState<string>("");

  const [ signer, setSigner ] = useState<any | null>(null);
  const [ address, setAddress ] = useState<string>("");

  const [ jointPrefix, setJointPrefix ] = useState<string>("");
  const [ msg, setMsg ] = useState<string>("");
  const [ sig, setSig ] = useState<string>("");

  const [ eip712Value, setEip712Value ] = useState<EIP712Value>();
  const [ msghash, setMsghash ] = useState<string>("");
  const [ pubkey, setPubkey ] = useState<string>("");

  const [ loadingMessage, setLoadingMessage ] = useState<string>("");
  const [ proof, setProof ] = useState(null);
  const [ publicSignals, setPublicSignals ] = useState(null);

  const [ slideoverOpen, setSlideoverOpen ] = useState<boolean>(false);
  const [ slideoverContent, setSlideoverContent ] = useState<any | null>(null);
  const [ slideoverTitle, setSlideoverTitle ] = useState<string>("");

  const [ proofIpfs, setProofIpfs ] = useState(null);
  const [ tweetLink, setTweetLink ] = useState(null);

  const [ msgType, setMsgType ] = useState<string | null>(null);
  const [ replyId, setReplyId ] = useState<string | null>(null);

  useEffect(() => {
    async function getMerkleTree () {
      if (!groupId) {
        return;
      }

      if (groupId === "daohack") {
        treeFromCloudfront("daohack.json").then((tree: MerkleTree) => {
          setMerkleTree(tree);
          setGroupName(tree.full_name);
          setRoot(tree.root);
          setStage(Stage.WALLET);
        });
      } else {
        const resp = await fetch(`/api/trees/${groupId}`);
        const respData: MerkleTree = await resp.json();
        if (!resp.ok) {
          setStage(Stage.INVALID);
          return;
        }
        setIsModerated(respData.moderation_status !== "NONE");
        setMerkleTree(respData);
        setGroupName(respData.full_name);
        setJointPrefix(
          respData.joint_name === null ? "" : respData.joint_name + "\n\n"
        );
        setRoot(respData.root);
        setStage(Stage.WALLET);
      }
    }
    getMerkleTree();
  }, [ groupId ]);

  const parseReplyId = (replyTweetLink: string) => {
    setReplyId(null);
    const linkRegex = /.*twitter.com\/.*\/(\d*)/g;
    const matches = linkRegex.exec(replyTweetLink);
    if (!matches) {
      return;
    }
    console.log(matches![ 1 ]);
    setReplyId(matches[ 1 ]);
  };

  const signMessage = () => {
    const signMessageAsync = async () => {
      const signature = await eip712Sign(signer, msgType!, msg);
      console.log(`typed sig: ${signature}`);
      setSig(signature);

      const eip712Value: EIP712Value = {
        platform: "twitter",
        type: msgType!,
        contents: msg,
      };
      setEip712Value(eip712Value);
      const msgHash = eip712MsgHash(eip712Value);
      setMsghash(msgHash);

      const pubkey = ethers.utils.recoverPublicKey(msgHash, signature);
      setPubkey(pubkey);
      const recoveredAddress = ethers.utils.computeAddress(pubkey);
      console.log(`recovered address: ${recoveredAddress}`);

      const actualAddress = await signer.getAddress();
      console.log(actualAddress);
      if (recoveredAddress != actualAddress) {
        console.log(
          `Address mismatch on recovery! Recovered ${recoveredAddress} but signed with ${actualAddress}`
        );
        setStage(Stage.NEWADDRESS);
      } else {
        setStage(Stage.GENERATE);
      }
    };

    signMessageAsync();
  };

  const genProof = () => {
    const genProofAsync = async () => {
      if (!merkleTree) {
        return;
      }

      const input = buildInput(
        merkleTree.proof,
        merkleTree,
        BigInt(address).toString(),
        pubkey,
        msghash,
        sig
      );
      console.log(
        JSON.stringify(
          input,
          (k, v) => (typeof v == "bigint" ? v.toString() : v),
          2
        )
      );

      console.log("Proof inputs:");
      console.log(input);

      setStage(Stage.INPROGRESS);

      setLoadingMessage("Downloading proving key");
      await downloadProofFiles(merkleTree.proof);

      setLoadingMessage("Generating proof");
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
    console.log(
      "proof-data",
      JSON.stringify({
        proof,
        publicSignals,
        eip712Value,
        groupId,
        replyId,
      })
    );
    const resp = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        proof,
        publicSignals,
        eip712Value,
        groupId,
        replyId,
      }),
    });

    if (isModerated) {
      setStage(Stage.PENDING);
    } else {
      const respData = await resp.json();
      setProofIpfs(respData[ "ipfsHash" ]);
      setTweetLink(respData[ "tweetURL" ]);
      setStage(Stage.SUCCESS);
    }
  };

  const openSlideOver = (slideoverContent: any, title: string) => {
    setSlideoverTitle(title);
    setSlideoverContent(slideoverContent);
    setSlideoverOpen(true);
  };

  const toggleMsgType = (event: any) => {
    if (event.target.value === "reply") {
      setMsgType("reply");
    } else if (event.target.value === "post") {
      setMsgType("post");
      setReplyId(null);
    } else {
      setMsgType(null);
      setReplyId(null);
    }
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

        <div className="flex h-full items-center justify-center bg-heyanonred text-white">
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
              <div className="flex justify-center pt-10">
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
                {(stage === Stage.WALLET || stage === Stage.NEWADDRESS) && (
                  <>
                    <InfoRow name="Group" content={`${groupName}`} />
                    <InfoRow
                      name="Merkle root"
                      content={<Tooltip text={`${root}`} />}
                    />
                    {isModerated && (
                      <InfoRow
                        name="Moderation"
                        content={
                          <InfoTooltip
                            status={"On"}
                            info={`This group has been flagged as potentially unsafe. All verified tweets will be reviewed by our team before public posting.`}
                          />
                        }
                      />
                    )}
                  </>
                )}
                {stage === Stage.NEWADDRESS && (
                  <InfoRow name="Connected address" content={`${address}`} />
                )}
                {stage === Stage.MSGTYPE && (
                  <div>
                    <div onChange={(event) => toggleMsgType(event)}>
                      <input type="radio" value="post" name="msg_type" /> Post
                      <br />
                      <input type="radio" value="reply" name="msg_type" /> Reply
                      <br />
                    </div>

                    {msgType === "reply" && (
                      <>
                        <br />

                        <div>
                          <textarea
                            rows={4}
                            name="replyTweetLink"
                            id="replyTweetLink"
                            className="block w-full resize-none rounded-md border-gray-300 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm	p-5"
                            placeholder={"Enter full tweet link to reply to..."}
                            onChange={(e) => parseReplyId(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
                {stage === Stage.TWEET && (
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
                {stage === Stage.GENERATE && (
                  <>
                    <InfoRow name="Group" content={`${groupName}`} />
                    <InfoRow
                      name="Merkle root"
                      content={<Tooltip text={`${root}`} />}
                    />
                    <InfoRow
                      name="Address"
                      content={<Tooltip text={`${address}`} />}
                    />
                    <InfoRow name="Message" content={`${msg}`} />
                  </>
                )}
                {stage === Stage.INPROGRESS && (
                  <LoadingText
                    currentStage={`${loadingMessage}`}
                    isProof={true}
                  />
                )}
                {stage === Stage.SUBMIT && (
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
                {stage === Stage.PENDING && (
                  <>
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
                    <InfoRow
                      name="Status"
                      content={`Will be reviewed in 1-2 days.`}
                    />
                  </>
                )}
                {stage === Stage.SUCCESS && (
                  <>
                    <InfoRow
                      name="Link"
                      content={<a href={`${tweetLink}`}>{`${tweetLink}`}</a>}
                    />
                    <InfoRow name="IPFS Hash" content={`${proofIpfs}`} />
                  </>
                )}
              </div>

              <div className="flex justify-center py-2">
                {(stage === Stage.WALLET || stage === Stage.NEWADDRESS) && (
                  <Button onClick={async () => await userConnectToMetamask(merkleTree, setSigner, setAddress, setStage)}>Connect Metamask</Button>
                )}
                {stage === Stage.MSGTYPE &&
                  msgType !== null &&
                  (msgType === "post" || replyId !== null) && (
                    <div>
                      <Button onClick={() => setStage(Stage.TWEET)}>
                        Next
                      </Button>
                    </div>
                  )}
                {stage === Stage.TWEET && (
                  <Button
                    disabled={
                      msg === null ||
                      msg.length === 0 ||
                      msg.length > MAX_MESSAGE_LENGTH - jointPrefix.length
                    }
                    onClick={signMessage}
                    className="disabled:opacity-50"
                  >
                    {msg.length > MAX_MESSAGE_LENGTH - jointPrefix.length
                      ? "Message too long"
                      : "Sign"}
                  </Button>
                )}
                {stage === Stage.GENERATE && (
                  <Button onClick={genProof}>Generate</Button>
                )}
                {stage === Stage.SUBMIT && (
                  <Button onClick={submit}>Submit</Button>
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
