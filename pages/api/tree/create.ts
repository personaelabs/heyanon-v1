import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  createLeaf,
  createUser,
  getUserId,
} from "../../../common/utils/heyanondb";

type LeavesEntries = {
  leaves: any;
};

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeavesEntries>
) {
  const body = req.body;
  for (const address of Object.keys(body.leafToPathElements)) {
    let userId = await getUserId(address, prisma);
    if (!userId) {
      userId = await createUser(address, prisma);
    }
    const leaf = await createLeaf(
      body.leafToPathElements[address],
      body.leafToPathIndices[address],
      userId.id,
      body.groupId,
      prisma
    );
    console.log(leaf)
  }

  console.log(body);
  res.status(200).json({ leaves: [] });
}
