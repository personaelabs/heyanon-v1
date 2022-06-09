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
  console.log(`Received request: ${JSON.stringify(body)}`);
  const proof = body.proof;
  const publicSignals = body.publicSignals;
  const message = body.message;

  // TODO: do we need error handling here?
  const cid = await postToIpfs(JSON.stringify(proof));
  console.log(`Posted to ipfs: ${cid.toString()}`);

  const verified = await verifyProof(proof, publicSignals);
  console.log(`Verification status: ${verified}`);
  if (verified) {
    await postTweet(`${message}
    
proof(ipfs): ${cid.toString()}`);
    res.status(200).json({ ipfsHash: cid.toString() });
  } else {
    console.log(`Failed verification for proof ${proof}`);
    res.status(200).json("failed verification");
  }
}
