import { buildTreePoseidon } from "../../data/src/merklePoseidon"; // on pierre/data-merge

// Providing hardcoded test addresses for now
export const fooAddresses = [
  "0x5d07904bb86cbf524b42d4e7d292a867f05d3b31",
  "0x8dc13e92246b9e9a494173f28b07262b30cc545c",
  "0xe0a0a42de89c695cffee76c50c3da710bb22c112",
  "0x89775a51ee6533d75ebc01d0c75ed1a400b4aac3",
];

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

export const exportTree = async () => {};
