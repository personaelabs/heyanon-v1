import type { NextApiRequest, NextApiResponse } from "next";
import { postToIpfs } from "../../lib/ipfs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let body = req.body;
  if (typeof req.body === "string") {
    body = JSON.parse(body);
  }
  console.log(`Received request: ${JSON.stringify(body)}`);
  const msg = body.msg;

  const cid = await postToIpfs(msg);
  res.status(200).json({ ipfsHash: cid.toString() });
}
