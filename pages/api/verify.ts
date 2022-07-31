import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

import { postToIpfs } from "../../lib/backend/ipfs";
import { postTweet } from "../../lib/backend/twitter";
import { verifyProof } from "../../lib/zkp";
import { MerkleTree } from "../../lib/merkleTree";
import { eip712MsgHash, EIP712Value } from "../../lib/hashing";

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
 * Verifies that the public signals corresponding to a submitted proof are consistent with the parameters in a request body
 *
 */
function verifyRequestConsistency(
  publicSignals: string[],
  groupMerkleTree: MerkleTree,
  eip712Value: EIP712Value
) {
  // groupID must correspond with the merkle root in public signals
  const merkleRoot = publicSignals[0];
  if (merkleRoot !== groupMerkleTree.root) {
    console.log(
      `Expected merkle root ${groupMerkleTree.root} got ${merkleRoot}`
    );
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

  // TODO: should turn this into request validation
  const proof = body.proof;
  const publicSignals: string[] = body.publicSignals;
  const eip712Value: EIP712Value = body.eip712Value;
  const replyId = body.replyId;

  const groupId = body.groupId;
  const filePath = path.resolve("./pages/api/trees", `${groupId}.json`);
  const buffer = fs.readFileSync(filePath);
  const groupMerkleTree: MerkleTree = JSON.parse(buffer.toString());

  if (!verifyRequestConsistency(publicSignals, groupMerkleTree, eip712Value)) {
    res.status(400).send("Inconsistent request");
    return;
  }

  if (!verifyProof(proof, publicSignals)) {
    console.log(`Failed verification for proof ${proof}`);
    res.status(400).send("Failed proof verification");
  }

  const cid = await postToIpfs(
    JSON.stringify({
      proof: proof,
      publicSignals: publicSignals,
      eip712Value,
      groupName: groupMerkleTree.groupName,
    })
  );
  console.log(`Posted to ipfs: ${cid.toString()}`);

  const tweetURL =
    eip712Value.type === "post"
      ? await postTweet(
          `${eip712Value.contents}
  
heyanon.xyz/verify/${cid.toString()}`,
          groupMerkleTree.secretIndex,
          groupMerkleTree.twitterAccount
        )
      : await postTweet(
          `${eip712Value.contents}
  
heyanon.xyz/verify/${cid.toString()}`,
          groupMerkleTree.secretIndex,
          groupMerkleTree.twitterAccount,
          replyId
        );

  res.status(200).json({ ipfsHash: cid.toString(), tweetURL: tweetURL });
}
