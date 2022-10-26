import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

type GroupEntry = {
  groupId: any;
};

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GroupEntry>
) {
  const body = req.body;
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
  // @dev field not in group creation model
  delete body["twitter_account"];
  console.log(body);
  const createdGroup = await prisma.group.create({
    data: body,
  });
  res.status(200).json({ groupId: createdGroup.id });
}
