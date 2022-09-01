// __tests__/animal.test.js
// 🚨 Remember to keep your `*.test.js` files out of your `/pages` directory!
import { createMocks } from "node-mocks-http";
import handler from "../../../../pages/api/trees/[groupId]";

import fs from "fs";
import path from "path";

describe("/api/trees/[groupId]", () => {
  test("database has same values as old JSON files", async () => {
    const files = fs
      .readdirSync("./__tests__/pages/api/trees")
      .filter((file) => file.endsWith(".json"));

    for (const filename of files) {
      const fileGroupId = filename.slice(0, filename.length - 5);

      const { req, res } = createMocks({
        method: "GET",
        query: {
          groupId: fileGroupId,
        },
      });

      await handler(req, res);
      expect(res._getStatusCode()).toBe(200);
      const group = JSON.parse(res._getData());

      const filePath = path.resolve("./__tests__/pages/api/trees", filename);
      const buffer = fs.readFileSync(filePath);
      const data = JSON.parse(buffer.toString());

      expect(group).toEqual(
        expect.objectContaining({
          root: data.root,
          abbr_name: fileGroupId,
        })
      );

      if (fileGroupId !== "daohack") {
        // if not daohack group, should have same number of leaves
        expect(group.leaves.length).toEqual(
          Object.keys(data.leafToPathElements).length
        );
      }
    }
  });
});