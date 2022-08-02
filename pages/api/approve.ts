import type { NextApiRequest, NextApiResponse } from "next";

import { modApprove } from "../../lib/backend/database";

/**
 * Posts all messages with two approvals.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let postedTweets = await modApprove();
    res.status(200).send(`Approval successful.`);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e.message);
  }
}
