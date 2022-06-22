import type { NextApiRequest, NextApiResponse } from "next";
import { postTweet } from "../../../lib/twitter";

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

  const tweetURL = await postTweet(msg);
  res.status(200).json({ tweetURL: tweetURL });
}
