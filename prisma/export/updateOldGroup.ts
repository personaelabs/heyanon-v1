import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

import prisma from "../../lib/prisma";

async function main() {
  let updateGroupName = "heyanontest";

  const directoryPath = path.join(__dirname, "../../__tests__/pages/api/trees");
  let file = `${updateGroupName}.json`;
  const buffer = fs.readFileSync(directoryPath + "/" + file);
  const data = JSON.parse(buffer.toString());

  const oldGroup = await prisma.group.findUnique({
    where: {
      abbr_name: updateGroupName,
    },
  });

  await prisma.group.update({
    where: {
      id: oldGroup!.id,
    },
    data: {
      root: data.root,
      approved: true,
      abbr_name: data.groupId,
      full_name: data.groupName,
      how_generated: data.howGenerated,
      moderation_status: "NONE",
      description: data.description,
      why_useful: data.whyUseful,
    },
  });

  const allAddresses = Object.keys(data.leafToPathElements);

  for (const [i, address] of allAddresses.entries()) {
    // find user or create them
    let user = await prisma.user.findUnique({
      where: {
        key: address,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          key: address,
          site_admin: false,
        },
      });
    }

    // update old leaf
    let oldLeaf = await prisma.leaf.findFirst({
      where: {
        user_id: user.id,
        group_id: oldGroup!.id,
      },
    });
    if (oldLeaf) {
      await prisma.leaf.updateMany({
        where: {
          user_id: user.id,
          group_id: oldGroup!.id,
        },
        data: {
          path: data.leafToPathElements[address],
          indices: data.leafToPathIndices[address],
        },
      });
    } else {
      // initialize leaf
      await prisma.leaf.create({
        data: {
          path: data.leafToPathElements[address],
          indices: data.leafToPathIndices[address],
          user_id: user.id,
          group_id: oldGroup!.id,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
