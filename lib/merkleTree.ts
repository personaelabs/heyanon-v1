// TODO: can pull from a json file later

// NOTE: the below is nonsense data for testing!
const addressToBranch: Record<string, []> = {
  "0xed625c9ABa1245Fa8e22eb1f1825881517A9DCE7": [],
};
const addressToBranchIndices: Record<string, []> = {
  "0xed625c9ABa1245Fa8e22eb1f1825881517A9DCE7": [],
};
export const merkleTree = {
  root: "",
  addressToBranch,
  addressToBranchIndices,
};

export function addressInTree(address: string) {
  return address in merkleTree.addressToBranch;
}
