import { buildTreePoseidon } from "./merklePoseidon"; // on pierre/data-merge

export const checkGroupExists = async (dbEntry: any, route: string) => {
  const responseExists = await fetch(route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      twitterAccount: dbEntry.twitterAccount,
      groupName: dbEntry.groupName,
    }),
  });
  return responseExists;
};

export const uploadTree = async (
  leafToPathElements: { user: string[] },
  leafToPathIndices: { user: string[] },
  groupId: number,
  route: string
) => {
  await fetch(route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      leafToPathElements,
      leafToPathIndices,
      groupId,
    }),
  });
};

export const createGroupEntry = async (tree: any, route: string) => {
  const treeCreated = await fetch(route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      root: tree.root.toString(),
      approved: tree.approved,
      twitter_account: tree.twitterAccount,
      abbr_name: tree.groupId,
      full_name: tree.groupName,
      how_generated: tree.howGenerated,
      moderation_status: tree.moderationStatus,
      description: tree.description,
      why_useful: tree.whyUseful,
      static: true,
      proof_id: 1,
    }),
  });
  return treeCreated;
};

export const formatCreateTreeJSONBody = (body: any) => {
  // JSON stringify is not able to serialize bigint
  body.root = body.root.toString();
  const addresses = Object.keys(body.leafToPathElements);
  addresses.map((address) => {
    // path element h(a, b) converted cast to string from bigint
    body.leafToPathElements[address] = body.leafToPathElements[address].map(
      (element: bigint) => element.toString()
    );
    // path element h(a, b) converted cast to string from number
    body.leafToPathIndices[address] = body.leafToPathIndices[address].map(
      (index: number) => index.toString()
    );
  });
  return body;
};

interface TreeDetails {
    groupId: string;
    groupName: string;
    twitterAccount: string;
    description: string;
    whyUseful: string;
    howGenerated: string;
    secretIndex: number;
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
