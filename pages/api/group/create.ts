import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GroupEntryResponse | ServerErrorResponse>
) {
  const body = req.body;
  try {
    const createdCredential = await prisma.credential.create({
      data: {
        twitter_account: body.twitter_account,
        twit_consumer_key: "",
        twit_consumer_secret: "",
        twit_access_token: "",
        twit_access_secret: "",
      },
    });
    body["credential_id"] = createdCredential.id;
    // @dev twitter_account field not in group creation model
    delete body["twitter_account"];
    const createdGroup = await prisma.group.create({
      data: body,
    });
    res.status(200).json({ groupId: createdGroup.id });
  } catch (error) {
    res.status(500).json({
      error: "Error",
    });
  }
}
