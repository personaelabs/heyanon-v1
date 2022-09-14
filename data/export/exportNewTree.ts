import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const directoryPath = path.join(__dirname, "../../__tests__/pages/api/trees");

  // find all json files
  let files = ["genvalidators.json"];

  for (const file of files) {
    console.log(file);

    const buffer = fs.readFileSync(directoryPath + "/" + file);
    const data = JSON.parse(buffer.toString());

    // check if credential is reused
    let credential = await prisma.credential.findFirst({
      where: {
        twitter_account: data.twitterAccount,
      },
    });

    if (!credential) {
      credential = await prisma.credential.create({
        data: {
          twitter_account: data.twitterAccount,
          twit_consumer_key: "",
          twit_consumer_secret: "",
          twit_access_token: "",
          twit_access_secret: "",
        },
      });
    }

    // skip remaining steps if group already exists
    const groupExists = await prisma.group.count({
      where: {
        root: data.root,
        abbr_name: data.groupId,
      },
    });
    if (groupExists > 0) {
      continue;
    }

    const createdGroup = await prisma.group.create({
      data: {
        root: data.root,
        approved: true,
        abbr_name: data.groupId,
        full_name: data.groupName,
        how_generated: data.howGenerated,
        moderation_status: "NONE",
        description: data.description,
        why_useful: data.whyUseful,
        static: true,
        proof_id: 1,
        credential_id: credential.id,
      },
    });

    // initialize users + leaves, if not daohack
    if (file != "daohack.json") {
      const allAddresses = Object.keys(data.leafToPathElements);

      for (const [i, address] of allAddresses.entries()) {
        if (i % 100 == 0) {
          console.log(i);
          console.time((i / 100).toString());
          if (i != 0) console.timeEnd((i / 100 - 1).toString());
        }

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

        // initialize leaf
        const leaf = await prisma.leaf.create({
          data: {
            path: data.leafToPathElements[address],
            indices: data.leafToPathIndices[address],
            user_id: user.id,
            group_id: createdGroup.id,
          },
        });
      }
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
