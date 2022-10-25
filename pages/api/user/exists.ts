import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  groupNameExists,
  twitterAccountExists,
} from "../../../common/utils/heyanondb";

type ExistsData = {
  twitterExists: boolean;
  groupExists: boolean;
};

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExistsData>
) {
  const body = req.body;
  const twitterExists = await twitterAccountExists(body.twitterAccount, prisma);
  const groupExists = await groupNameExists(body.groupName, prisma);
  res
    .status(200)
    .json({ twitterExists: twitterExists, groupExists: groupExists });
}
