import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

import { postToIpfs } from "../../lib/backend/ipfs";
import { postTweet } from "../../lib/backend/twitter";
import { verifyProof } from "../../lib/zkp.snarkjs";
import prisma from "../../lib/prisma";
import { generateSignalHash } from "../../lib/semaphore";
import { HashedData } from "../../lib/tazUtils";

/**
 * Verifies that the public signals corresponding to a submitted proof are consistent with the parameters in a request body
 */
function verifyRequestConsistency(
  publicSignals: string[],
  hashedData: HashedData
) {
  // signalHash in public signals must correspond to the hash of the message body
  if (
    generateSignalHash(JSON.stringify(hashedData)).toString() !==
    publicSignals[2]
  ) {
    console.log(
      `Expected msg hash ${publicSignals[2]} got ${generateSignalHash(
        JSON.stringify(hashedData)
      ).toString()}`
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
  const hashedData: HashedData = body.hashedData;

  const group = await prisma.group.findUnique({
    where: {
      abbr_name: "taz",
    },
    include: {
      credential: true,
      proof: true,
    },
  });

  // const nullifier = await prisma.nullifier.findFirst({
  //   where: {
  //     value: hashedData.pubNullifier,
  //   },
  // });
  // if (!nullifier) {
  //   res.status(404).send("Nullifier not found");
  //   return;
  // }

  if (!verifyRequestConsistency(publicSignals, hashedData)) {
    res.status(400).send("Inconsistent request");
    return;
  }

  if (!verifyProof(proof, publicSignals, group!.proof)) {
    console.log(`Failed verification for proof ${proof}`);
    res.status(400).send("Failed proof verification");
    return;
  }

  const ipfsData = JSON.stringify({
    proof: proof,
    publicSignals: publicSignals,
    message: hashedData.msg,
    groupName: group!.full_name,
  });

  const cid = await postToIpfs(ipfsData);
  console.log(`Posted to ipfs: ${cid.toString()}`);

  let tweetURL;
  if (hashedData.msgType === "MESSAGE") {
    tweetURL = await postTweet(
      `A Devcon attendee says "${hashedData.msg}" ` +
        `\n\nheyanon.xyz/verify/${cid.toString()}`,
      group!.credential
    );
  } else {
    if (!hashedData.replyTweetId) {
      res.status(400).send("No reply tweet ID");
      return;
    }

    try {
      tweetURL = await postTweet(
        `A Devcon attendee replies with "${hashedData.msg}" ` +
          `\n\nheyanon.xyz/verify/${cid.toString()}`,
        group!.credential,
        hashedData.replyTweetId
      );
    } catch {
      res.status(400).send("Failed to reply to tweet");
    }
  }

  res.status(200).json({ ipfsHash: cid.toString(), tweetURL: tweetURL });
}
