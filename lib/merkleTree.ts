import { Prisma, PrismaClient, Proof } from "@prisma/client";

//@ts-ignore
import { buildTreePoseidon } from "merkle-poseidon/lib";

const loadURL = "https://d27ahxc61uj811.cloudfront.net/";

export type MerkleTree = Prisma.GroupGetPayload<{
  include: {
    leaves: {
      include: {
        user: true;
      };
    };
    nullifiers: true;
    proof: true;
    credential: {
      select: {
        twitter_account: true;
      };
    };
  };
}> & {
  leafToPathElements: { [address: string]: string[] };
  leafToPathIndices: { [address: string]: string[] };
};

export type TAZMerkleTree = {
  ext_nullifier: string;
  leafToPathElements: { [address: string]: string[] };
  leafToPathIndices: { [address: string]: string[] };
  proof: Proof;
};

export async function treeFromCloudfront(filename: string) {
  const link = loadURL + filename;
  const treeResp = await fetch(link, {
    method: "GET",
  });
  return treeResp.json();
}

export const generateTree = async (
  treeInfo: TreeDetails,
  addresses: string[]
) => {
  // @dev: for now: static, proof, credential id are static
  const tree: any = await buildTreePoseidon(addresses, 13, 30, 0n);
  tree["groupId"] = treeInfo.groupId;
  tree["groupName"] = treeInfo.groupName;
  tree["twitterAccount"] = treeInfo.twitterAccount;
  tree["description"] = treeInfo.description;
  tree["whyUseful"] = treeInfo.whyUseful;
  tree["howGenerated"] = treeInfo.howGenerated;
  tree["secretIndex"] = treeInfo.secretIndex;
  tree["approved"] = true;
  tree["moderationStatus"] = "NONE";
  tree["static"] = true;
  tree["proofId"] = 1;
  return tree;
};
