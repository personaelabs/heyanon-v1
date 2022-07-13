import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { Stepper, Title, Button } from "../../components/Base";
import Tooltip from "../../components/Tooltip";
import InfoRow from "../../components/InfoRow";
import Slideover from "../../components/Slideover";
import LoadingText from "../../components/LoadingText";
import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

import { setupWeb3 } from "../../lib/frontend/web3";
import { buildInput, generateProof, downloadProofFiles } from "../../lib/zkp";
import { MerkleTree, treeFromCloudfront } from "../../lib/merkleTree";

// tweet size minus ipfs hash length and '\nheyanon.xyz/verify/'
const MAX_MESSAGE_LENGTH = 280 - 73;

enum Stage {
  CONNECTING = "Retreiving group",
  INVALID = "Invalid group :(",
  WALLET = "Connect with Metamask",
  NEWADDRESS = "Invalid address, please change",
  TWEET = "Enter your tweet & sign",
  GENERATE = "Generate a ZK proof",
  INPROGRESS = "Proof is being generated",
  SUBMIT = "Submit proof and message",
  SUCCESS = "Message has been posted!",
}

const PostMsgPage = () => {
  const router = useRouter();
  const { groupId } = router.query;

  const [stage, setStage] = useState<Stage>(Stage.CONNECTING);
  const [merkleTree, setMerkleTree] = useState<MerkleTree>();
  const [root, setRoot] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");

  const [signer, setSigner] = useState<any | null>(null);
  const [address, setAddress] = useState<string>("");

  const [msg, setMsg] = useState<string>("");
  const [sig, setSig] = useState<string>("");
  const [msghash, setMsghash] = useState<string>("");
  const [pubkey, setPubkey] = useState<string>("");

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
      if (!groupId) {
        return;
      }
      if (groupId === "daohack") {
        treeFromCloudfront("daohack.json").then((tree) => {
          setMerkleTree(tree);
          setGroupName(tree.groupName);
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
        setMerkleTree(respData);
        setGroupName(respData.groupName);
        setRoot(respData.root);
        setStage(Stage.WALLET);
      }
    }
    getMerkleTree();
  }, [groupId]);

  const connectToMetamask = () => {
    const connectToMetamaskAsync = async () => {
      const { provider, signer, network } = await setupWeb3();
      setSigner(signer);
      const addr = await signer.getAddress();
      console.log(`Connected address: ${addr}`);
      setAddress(addr);

      if (!(BigInt(addr).toString() in merkleTree!.leafToPathElements)) {
        setStage(Stage.NEWADDRESS);
      } else {
        setStage(Stage.TWEET);
      }
    };
    connectToMetamaskAsync();
  };

  const signMessage = () => {
    const signMessageAsync = async () => {
      const signature = await signer.signMessage(msg);
      console.log(`sig: ${signature}`);
      setSig(signature);

      const msgHash = ethers.utils.hashMessage(msg);
      const msgHashBytes = ethers.utils.arrayify(msgHash);
      console.log(`msghash: ${msgHash}`);
      setMsghash(msgHash);

      const pubkey = ethers.utils.recoverPublicKey(msgHashBytes, signature);
      console.log(`pk: ${pubkey}`);
      setPubkey(pubkey);

      const recoveredAddress = ethers.utils.computeAddress(pubkey);
      const actualAddress = await signer.getAddress();
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
    let filename = "dizkus_64_4_30";

    const genProofAsync = async () => {
      if (!merkleTree) {
        return;
      }

      const input = buildInput(
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

      setStage(Stage.INPROGRESS);

      setLoadingMessage("Downloading proving key");
      await downloadProofFiles(filename);

      setLoadingMessage("Generating proof");
      const { proof, publicSignals } = await generateProof(input, filename);

      setProof(proof);
      setPublicSignals(publicSignals);

      setStage(Stage.SUBMIT);
    };

    genProofAsync();
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
        groupId: groupId,
      }),
    });
    const respData = await resp.json();
    setProofIpfs(respData["ipfsHash"]);
    setTweetLink(respData["tweetURL"]);
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

        <div className="flex h-full items-center justify-center bg-heyanonred text-white">
          <div className="prose max-w-prose">
            {stage !== Stage.INPROGRESS ? (
              <div className="flex justify-center py-5">
                <Image
                  src="/logo.svg"
                  alt="heyanon!"
                  width="180"
                  height="180"
                />
              </div>
            ) : (
              <div className="flex justify-center py-5">
                <Image
                  src="/logo_loading.gif"
                  alt="heyanon!"
                  width="200"
                  height="200"
                />
              </div>
            )}

            <div className="flex justify-between">
              <Stepper>ZK Proof Generation</Stepper>
            </div>

            <Title> {stage} </Title>

            <div className="my-5">
              {(stage === Stage.WALLET || stage === Stage.NEWADDRESS) && (
                <>
                  <InfoRow name="Group" content={`${groupName}`} />
                  <InfoRow
                    name="Merkle root"
                    content={<Tooltip text={`${root}`} />}
                  />
                </>
              )}
              {stage === Stage.NEWADDRESS && (
                <InfoRow name="Connected address" content={`${address}`} />
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
                  <InfoRow name="Address" content={`${address}`} />
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

            <div className="py-2">
              {(stage === Stage.WALLET || stage === Stage.NEWADDRESS) && (
                <Button onClick={connectToMetamask}>Connect Metamask</Button>
              )}
              {stage === Stage.TWEET && (
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
    </>
  );
};

export default PostMsgPage;
