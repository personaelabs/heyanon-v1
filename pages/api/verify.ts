import type { NextApiRequest, NextApiResponse } from "next";
import { postToIpfs } from "../../lib/ipfs";

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
  res: NextApiResponse
) {
  let body = req.body;
  if (typeof req.body === "string") {
    body = JSON.parse(body);
  }
  console.log(body);
  const proof = body.proof;
  const publicSignals = body.publicSignals;
  const message = body.message;

  // TODO: do we need error handling here?
  const cid = await postToIpfs(proof);

  const verified = await verifyProof(proof, publicSignals);
  if (verified) {
    await postTweet(message);
    res.status(200).json({ ipfsHash: cid.toString() });
  } else {
    console.log(`Failed verification for proof ${proof}`);
    res.status(200).json("failed verification");
  }
}
