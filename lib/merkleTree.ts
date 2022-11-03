import { Prisma, Proof } from "@prisma/client";
import axios from "axios";

//@dev TODO: global config file with such URLs
export const loadURL = "https://d27ahxc61uj811.cloudfront.net/";

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
  try {
    const response = (await axios.get(link));
    return response.data;
  } catch (error) {
    return undefined;
  }
}
