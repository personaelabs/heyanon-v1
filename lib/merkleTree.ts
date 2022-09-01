import { Prisma } from "@prisma/client";

const loadURL = "https://d27ahxc61uj811.cloudfront.net/";

export type MerkleTree = Prisma.GroupGetPayload<{
  include: {
    leaves: {
      include: {
        user: true;
      };
    };
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

export async function treeFromCloudfront(filename: string) {
  const link = loadURL + filename;
  const treeResp = await fetch(link, {
    method: "GET",
  });
  return treeResp.json();
}
