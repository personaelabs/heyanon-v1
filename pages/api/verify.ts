import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

import { postToIpfs } from "../../lib/backend/ipfs";
import { postTweet } from "../../lib/backend/twitter";
import { verifyProof } from "../../lib/zkp";
import { MerkleTree } from "../../lib/merkleTree";

// NOTE: this also exists in lib/frontend/zkp.ts
function bigIntToArray(n: number, k: number, x: bigint) {
  let divisor = 1n;
  for (var idx = 0; idx < n; idx++) {
    divisor = divisor * 2n;
  }

  let ret = [];
  var x_temp = BigInt(x);
  for (var idx = 0; idx < k; idx++) {
    ret.push(x_temp % divisor);
    x_temp = x_temp / divisor;
  }
  return ret;
}

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
  const publicSignals: string[] = body.publicSignals;
  const msg = body.message;
  const groupId = body.groupId;

  const merkleRoot = publicSignals[0];
  const msgHashArray = publicSignals.slice(1).map(BigInt);
  const expectedMsgHashArray = bigIntToArray(
    64,
    4,
    BigInt(ethers.utils.hashMessage(msg))
  );

  const filename = `${groupId}.json`;
  const filePath = path.resolve("./pages/api/trees", filename);
  const buffer = fs.readFileSync(filePath);
  const groupMerkleTree: MerkleTree = JSON.parse(buffer.toString());

  if (merkleRoot !== groupMerkleTree.root) {
    console.log(
      `Expected merkle root ${groupMerkleTree.root} got ${merkleRoot}`
    );
    res.status(400).json("incorrect merkle root used");
    return;
  }

  if (
    msgHashArray.length !== expectedMsgHashArray.length ||
    !msgHashArray.every((v, i) => v === expectedMsgHashArray[i])
  ) {
    console.log(
      `msghash in publicSignals: ${msgHashArray} hash of message: ${expectedMsgHashArray}`
    );
    res.status(400).json("incorrect message for msghash");
    return;
  }

  const verified = await verifyProof(proof, publicSignals);
  console.log(`Verification status: ${verified}`);

  if (verified) {
    const cid = await postToIpfs(
      JSON.stringify({
        proof: proof,
        publicSignals: publicSignals,
        message: msg,
        groupName: groupMerkleTree.groupName,
      })
    );
    console.log(`Posted to ipfs: ${cid.toString()}`);

    const tweetURL = await postTweet(
      `${msg}
  
heyanon.xyz/verify/${cid.toString()}`,
      groupMerkleTree.secretIndex,
      groupMerkleTree.twitterAccount
    );
    res.status(200).json({ ipfsHash: cid.toString(), tweetURL: tweetURL });
    return;
  }

  console.log(`Failed verification for proof ${proof}`);
  res.status(400).json("failed verification");
}
