const localforage = require("localforage");
const snarkjs = require("snarkjs");

const loadURL = "https://d27ahxc61uj811.cloudfront.net/";

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

export async function treeFromCloudfront(filename: string) {
  const link = loadURL + filename;
  const treeResp = await fetch(link, {
    method: "GET",
  });
  return treeResp.json();
}
