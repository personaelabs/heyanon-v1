import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { groupId } = req.query;

  const group = await prisma.group.findFirst({
    where: {
      abbr_name: groupId.toString(),
    },
    include: {
      leaves: true,
    },
  });

  if (group === null) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  const filename = `${groupId}.json`;
  let files = fs
    .readdirSync("./pages/api/trees")
    .filter((file) => file.endsWith(".json"));
  console.log(files);

  if (files.indexOf(filename) !== -1) {
    const filePath = path.resolve("./pages/api/trees", filename);
    const buffer = fs.readFileSync(filePath);
    const data = JSON.parse(buffer.toString());

    if (
      data.root !== group.root ||
      Object.keys(data.leafToPathElements).length !== group.leaves.length
    ) {
      res.status(404).json({ error: `Data for ${groupId} incorrectly added.` });
    } else {
      console.log(`Data for ${groupId} properly added.`);
    }
  }

  res.status(200).json({});
}
