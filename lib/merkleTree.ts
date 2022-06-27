export type MerkleTree = {
  root: string;
  leafToPathElements: { [address: string]: string[] };
  leafToPathIndices: { [address: string]: number[] };
  groupId: string;
  groupName: string;
  twitterAccount: string;
  description: string;
  whyUseful: string;
  howGenerated: string;
  secretIndex: number;
};
