import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { MerkleTree, treeFromCloudfront } from "../../lib/merkleTree";
import { Title } from "../../components/Base";
import { Tooltip } from "../../components/Tooltip";
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
      if (groupId === "daohack") {
        treeFromCloudfront("daohack.json").then((tree) => {
          setMerkleTree(tree);
          setStage(Stage.VALID);
        });
      } else {
        const resp = await fetch(`/api/trees/${groupId}`);
        const respData: MerkleTree = await resp.json();
        if (!resp.ok) {
          setStage(Stage.INVALID);
          return;
        }
        setMerkleTree(respData);
        setStage(Stage.VALID);
      }
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
          <div className="flex justify-center pt-10">
            <Image src="/logo.svg" alt="heyanon!" width="174" height="120" />
          </div>

          <div className="px-8">
            {stage === Stage.INVALID && (
              <div className="flex justify-center text-center">
                <Title>{Stage.INVALID}</Title>
              </div>
            )}

            {stage === Stage.CONNECTING && (
              <>
                <div className="flex justify-center text-center">
                  <Title>{groupId}</Title>
                </div>
                <LoadingText currentStage="Retreiving group" isProof={false} />
              </>
            )}

            {stage === Stage.VALID && (
              <div>
                <div className="flex justify-center text-center">
                  <Title>
                    <a
                      href={`https://twitter.com/${
                        merkleTree!.credential.twitter_account
                      }`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      @{merkleTree!.credential.twitter_account}
                    </a>
                  </Title>
                </div>
                <InfoRow name="Full name" content={merkleTree!.full_name} />
                <InfoRow
                  name="Root"
                  content={<Tooltip text={merkleTree!.root} />}
                />
                <InfoRow name="Description" content={merkleTree!.description} />
                <InfoRow name="Why" content={merkleTree!.why_useful} />
                <InfoRow
                  name="How was it generated"
                  content={merkleTree!.how_generated}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
