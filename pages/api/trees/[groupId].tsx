import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { MerkleTree } from "../../../lib/merkleTree";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { groupId } = req.query;

  const group = await prisma.group.findUnique({
    where: {
      abbr_name: groupId.toString(),
    },
    include: {
      leaves: {
        include: {
          user: true,
        },
      },
      nullifiers: true,
      proof: true,
      credential: {
        select: {
          twitter_account: true,
        },
      },
    },
  });

  if (group === null) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  let leafToPathElements: { [address: string]: string[] } = {};
  let leafToPathIndices: { [address: string]: string[] } = {};

  for (const leaf of group.leaves) {
    leafToPathElements[leaf.user.key] = leaf.path;
    leafToPathIndices[leaf.user.key] = leaf.indices;
  }

  group.leaves = [];

  res.status(200).json({ ...group, leafToPathElements, leafToPathIndices });
}
