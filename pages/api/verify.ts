import type { NextApiRequest, NextApiResponse } from "next";

import { postTweet } from "../../lib/twitter";
import { verifyProof } from "../../lib/zkp";

/**
 * Verify a user's proof and send a tweet if it passes verification
 *
 * @param req
 * @param res
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  // TODO: message?
  let body = req.body;
  if (typeof req.body === "string") {
    body = JSON.parse(body);
  }
  console.log(body);
  const proof = body.proof;
  const publicSignals = body.publicSignals;

  const verified = await verifyProof(proof, publicSignals);
  if (verified) {
    // TODO: figure out message + proof rendering
    await postTweet("");
  } else {
    console.log(`Failed verification for proof ${proof}`);
    res.status(200).json("failed verification");
  }
}
