import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { groupId } = req.query;
  const filename = `${groupId}.json`;
  try {
    const filePath = path.resolve("./pages/api/trees", filename);
    const buffer = fs.readFileSync(filePath);
    const data = JSON.parse(buffer.toString());
    res.status(200).json(data);
  } catch (e) {
    res.status(404).json({ error: "File not found" });
  }
}
