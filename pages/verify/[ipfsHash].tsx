import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";

import { Stepper, Title, Button } from "../../components/Base";
import Tooltip from "../../components/Tooltip";
import InfoRow from "../../components/InfoRow";
import LoadingText from "../../components/LoadingText";
import Slideover from "../../components/Slideover";
import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

import { verifyProof } from "../../lib/frontend/zkp";

enum FileStage {
  CONNECTING,
  INVALID,
  VALID,
}

const VerifyPage = () => {
  const router = useRouter();
  const { ipfsHash } = router.query;
  const [stage, setStage] = useState<FileStage>(FileStage.CONNECTING);
  const [verifyStatus, setVerifyStatus] = useState<string>("Not verified");
  const [proof, setProof] = useState(null);
  const [publicSignals, setPublicSignals] = useState(null);
  const [message, setMessage] = useState<string>("");
  const [root, setRoot] = useState<string>("");

  const [slideoverOpen, setSlideoverOpen] = useState<boolean>(false);
  const [slideoverContent, setSlideoverContent] = useState<any | null>(null);
  const [slideoverTitle, setSlideoverTitle] = useState<string>("");

  useEffect(() => {
    async function submit() {
      const resp = await fetch(`/api/getproof/${ipfsHash}`);
      const respData = JSON.parse(await resp.json());

      if (
        !resp.ok ||
        !respData.proof ||
        !respData.publicSignals ||
        !respData.message
      ) {
        setStage(FileStage.INVALID);
        return;
      } else {
        setStage(FileStage.VALID);
        setProof(respData.proof);
        setPublicSignals(respData.publicSignals);
        setMessage(respData.message);
        setRoot(respData.publicSignals[0]);
      }
    }
    if (ipfsHash) {
      submit();
    }
  }, [ipfsHash]);

  const verifyProofInBrowser = async () => {
    setVerifyStatus("Verifying...");
    const proofVerified = await verifyProof(proof, publicSignals);
    if (proofVerified) {
      setVerifyStatus("Verified in-browser ✅");
    } else {
      setVerifyStatus("Proof is not valid");
    }
  };

  const openSlideOver = (slideoverContent: any, title: string) => {
    setSlideoverTitle(title);
    setSlideoverContent(slideoverContent);
    setSlideoverOpen(true);
  };

  return (
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
          <div className="flex justify-center py-10">
            <Image src="/logo.svg" alt="heyanon!" width="174" height="120" />
          </div>
          <div className="flex justify-between">
            <Stepper>ZK Proof Verification</Stepper>
          </div>
          <Title>Proof details</Title>
          <div className="my-5">
            <InfoRow name="IPFS hash" content={`${ipfsHash}`} />
            {stage === FileStage.CONNECTING && (
              <LoadingText currentStage="Connecting to IPFS" />
            )}

            {stage === FileStage.INVALID && (
              <InfoRow name="Error" content="Invalid IPFS hash" />
            )}

            {stage === FileStage.VALID && (
              <>
                <InfoRow name="Message" content={message} />
                <InfoRow name="Root" content={<Tooltip text={root} />} />
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
                <InfoRow name="Verification status" content={verifyStatus} />
              </>
            )}
          </div>

          <div className="flex py-2">
            {stage === FileStage.VALID && (
              <Button className="mr-5" onClick={verifyProofInBrowser}>
                Verify in-browser
              </Button>
            )}
            {stage === FileStage.VALID && (
              <Button disabled={true} className="opacity-50">
                Verify on-chain (soon!){" "}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
