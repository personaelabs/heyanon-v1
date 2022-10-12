import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prisma";

/**
 * Verify a user's proof and send a tweet if it passes verification
 * checks:
 * - merkle root in public signals matches that of the bot being posted to
 * - msghash is (eip712) hash of message
 * - proof + publicSignals pass verification
 *
 * @param req
 * @param res
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let body = req.body;
  if (typeof req.body === "string") {
    body = JSON.parse(body);
  }
  console.log(`Received request: ${JSON.stringify(body)}`);

  const pubNullifier = body.pubNullifier;

  const tazGroup = await prisma.group.findUnique({
    where: {
      abbr_name: "taz",
    },
  });
  const nullifier = await prisma.nullifier.findFirst({
    where: {
      value: pubNullifier,
    },
  });
  if (!nullifier) {
    await prisma.nullifier.create({
      data: {
        value: pubNullifier,
        reputation: 1,
        group_id: tazGroup!.id,
      },
    });
  }

  res.status(200).json({});
}
