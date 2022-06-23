import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";

import { IPFS, create } from "ipfs-core";

import { Stepper, Title, Button } from "../../components/Base";
import InfoRow from "../../components/InfoRow";

const VerifyPage = () => {
  const router = useRouter();
  const { ipfsHash } = router.query;

  const [proof, setProof] = useState<string>();

  const loadData = async () => {
    let node: IPFS;
    console.log(ipfsHash?.toString());

    node = await create();
    if (!ipfsHash) {
      return;
    }
    const stream = node.cat(ipfsHash.toString());
    const decoder = new TextDecoder();
    let data = "";

    for await (const chunk of stream) {
      // chunks of data are returned as a Uint8Array, convert it back to a string
      data += decoder.decode(chunk, { stream: true });
    }

    setProof(data);
    await node.stop();
  };

  loadData();

  return (
    <>
      <div className="h-screen">
        <Head>
          <title>heyanon!</title>
          <link rel="icon" href="/heyanon.ico" />
          <script async src="snarkjs.min.js"></script>
        </Head>

        <div className="flex h-full items-center justify-center bg-heyanonred text-white">
          <div>
            <div className="flex justify-center py-10">
              <Image src="/logo.svg" alt="heyanon!" width="174" height="120" />
            </div>
            <div className="flex justify-between">
              <Stepper>ZK Proof Verification</Stepper>
            </div>
            <Title>Proof details</Title>
            <div className="my-5">
              <InfoRow name="IPFS hash" content={`${ipfsHash}`} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyPage;
