// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { postTweet } from "../../lib/twitter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  await postTweet("testing from node+oauth1.0a");
  res.status(200).json("foobar");
}
