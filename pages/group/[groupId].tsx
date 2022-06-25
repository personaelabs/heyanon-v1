import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { MerkleTree } from "../../lib/merkleTree";
import { Stepper, Title, Button } from "../../components/Base";
import Tooltip from "../../components/Tooltip";
import InfoRow from "../../components/InfoRow";
import LoadingText from "../../components/LoadingText";

enum Stage {
  CONNECTING = "Retreiving group",
  INVALID = "Invalid group :(",
  VALID = "Group details",
}

const GroupPage = () => {
  const router = useRouter();
  const { groupId } = router.query;

  const [stage, setStage] = useState<Stage>(Stage.CONNECTING);
  const [merkleTree, setMerkleTree] = useState<MerkleTree>();

  useEffect(() => {
    async function getMerkleTree() {
      if (!groupId) {
        return;
      }
      const resp = await fetch(`/api/trees/${groupId}`);
      const respData: MerkleTree = await resp.json();
      if (!resp.ok) {
        setStage(Stage.INVALID);
        return;
      }
      setMerkleTree(respData);
      setStage(Stage.VALID);
    }
    getMerkleTree();
  }, [groupId]);

  return (
    <div className="h-screen">
      <Head>
        <title>heyanon!</title>
        <link rel="icon" href="/heyanon.ico" />
        <script async src="snarkjs.min.js"></script>
      </Head>

      <div className="flex h-full items-center justify-center bg-heyanonred text-white">
        <div className="prose max-w-prose">
          <div className="flex justify-center py-10">
            <Image src="/logo.svg" alt="heyanon!" width="174" height="120" />
          </div>

          <div className="flex justify-between">
            <Stepper>Heyanon group</Stepper>
          </div>

          <Title>{stage}</Title>

          <div className="my-5">
            {stage === Stage.CONNECTING && (
              <LoadingText currentStage="Retreiving group" />
            )}

            {stage === Stage.VALID && (
              <>
                <InfoRow name="Name" content={merkleTree!.groupName} />
                <InfoRow
                  name="Root"
                  content={<Tooltip text={merkleTree!.root} />}
                />
                <InfoRow
                  name="Twitter account"
                  content={`twitter.com/${merkleTree!.twitterAccount}`}
                />
                <InfoRow name="Description" content={merkleTree!.description} />
                <InfoRow name="Why" content={merkleTree!.whyUseful} />
                <InfoRow
                  name="How was it generated"
                  content={merkleTree!.howGenerated}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
