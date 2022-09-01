import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { groupId } = req.query;

  const group = await prisma.group.findFirst({
    where: {
      abbr_name: groupId.toString(),
    },
    include: {
      leaves: true,
    },
  });

  if (group === null) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  res.status(200).json(group);
}
