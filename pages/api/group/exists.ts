import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  groupNameExists,
  twitterAccountExists,
} from "../../../lib/common/utils/heyanondb";
import prisma from "../../../lib/prisma";

type ExistsData = {
  twitterExists: boolean;
  groupExists: boolean;
};

type ErrorData = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExistsData | ErrorData>
) {
  const body = req.body;
  try {
    const twitterExists = await twitterAccountExists(
      body.twitterAccount,
      prisma
    );
    const groupExists = await groupNameExists(body.groupName, prisma);
    res
      .status(200)
      .json({ twitterExists: twitterExists, groupExists: groupExists });
  } catch (err) {
    res.status(500).json({
      error: "Error",
    });
  }
}
