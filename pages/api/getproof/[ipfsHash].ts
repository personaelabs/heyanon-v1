import type { NextApiRequest, NextApiResponse } from "next";

import { readFromIpfs } from "../../../lib/backend/ipfs";

import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { ipfsHash } = req.query;
  console.log(`Received request: ${JSON.stringify(ipfsHash)}`);
  try {
    const data = await readFromIpfs(ipfsHash.toString());
    console.log(`Got data from ipfs: ${data}`);

    console.log(JSON.parse(data).groupName);

    const group = await prisma.group.findFirst({
      where: {
        full_name: JSON.parse(data).groupName,
      },
      include: {
        proof: true,
      },
    });

    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    res.status(200).json({ ...JSON.parse(data), proofType: group.proof });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}
