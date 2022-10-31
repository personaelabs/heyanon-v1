import type { NextApiRequest, NextApiResponse } from "next";
import {
  createLeaf,
  createUser,
  getUserId,
} from "../../../lib/common/utils/heyanondb";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeavesEntriesResponse | ServerErrorResponse>
) {
  const body = req.body;
  try {
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
    }
    res.status(200).json({ leaves: [] });
  } catch (error) {
    res.status(500).json({
      error: "Error",
    });
  }
}
