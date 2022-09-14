import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

import { postToIpfs } from "../../lib/backend/ipfs";
import { postTweet } from "../../lib/backend/twitter";
import { verifyProof, bigIntToArray } from "../../lib/zkp";
import { MerkleTree } from "../../lib/merkleTree";
import { eip712MsgHash, EIP712Value } from "../../lib/hashing";
import prisma from "../../lib/prisma";

/**
 * Verifies that the public signals corresponding to a submitted proof are consistent with the parameters in a request body
 */
function verifyRequestConsistency(
  publicSignals: string[],
  groupRoot: string,
  eip712Value: EIP712Value
) {
  // groupID must correspond with the merkle root in public signals
  const merkleRoot = publicSignals[0];
  if (merkleRoot !== groupRoot) {
    console.log(`Expected merkle root ${groupRoot} got ${merkleRoot}`);
    return false;
  }

  // msgHash in public signals must correspond to the hash of the message body
  const msgHashArray = publicSignals.slice(1).map(BigInt);

  const expectedMsgHash = eip712MsgHash(eip712Value);
  const expectedMsgHashArray = bigIntToArray(64, 4, BigInt(expectedMsgHash));
  if (
    msgHashArray.length !== expectedMsgHashArray.length ||
    !msgHashArray.every((v, i) => v === expectedMsgHashArray[i])
  ) {
    console.log(
      `Expected msg hash ${expectedMsgHashArray} got ${msgHashArray}`
    );
    return false;
  }

  return true;
}

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

  const proof = body.proof;
  const publicSignals: string[] = body.publicSignals;
  const eip712Value: EIP712Value = body.eip712Value;
  const replyId = body.replyId;

  const groupId = body.groupId;
  const group = await prisma.group.findUnique({
    where: {
      abbr_name: groupId.toString(),
    },
    include: {
      credential: true,
      proof: true,
    },
  });

  if (!group) {
    res.status(404).send("Group not found!");
    return;
  }

  if (!verifyRequestConsistency(publicSignals, group.root, eip712Value)) {
    res.status(400).send("Inconsistent request");
    return;
  }

  if (!verifyProof(proof, publicSignals, group.proof)) {
    console.log(`Failed verification for proof ${proof}`);
    res.status(400).send("Failed proof verification");
    return;
  }

  const ipfsData = JSON.stringify({
    proof: proof,
    publicSignals: publicSignals,
    message: eip712Value.contents,
    groupName: group.full_name,
  });

  const cid = await postToIpfs(ipfsData);
  console.log(`Posted to ipfs: ${cid.toString()}`);

  const tweetText =
    group.joint_name === null
      ? `${eip712Value.contents}
  
heyanon.xyz/verify/${cid.toString()}`
      : `${group.joint_name}

${eip712Value.contents}

heyanon.xyz/verify/${cid.toString()}`;

  const tweetURL =
    eip712Value.type === "post"
      ? await postTweet(tweetText, group.credential)
      : await postTweet(tweetText, group.credential, replyId);

  res.status(200).json({ ipfsHash: cid.toString(), tweetURL: tweetURL });
}
