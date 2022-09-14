import fs from "fs";
import path from "path";

import prisma from "../../lib/prisma";

async function main() {
  const directoryPath = path.join(__dirname, "../../__tests__/pages/api/trees");
  let file = "daohack.json";
  const buffer = fs.readFileSync(directoryPath + "/" + file);
  const data = JSON.parse(buffer.toString());

  // initialize users + leaves, if not daohack
  const daohackGroup = await prisma.group.findUnique({
    where: {
      abbr_name: "daohack",
    },
    include: {
      leaves: {
        include: {
          user: true,
        },
      },
      proof: true,
      credential: {
        select: {
          twitter_account: true,
        },
      },
    },
  });

  const newDaohackGroup = {
    ...daohackGroup,
    leafToPathElements: data.leafToPathElements,
    leafToPathIndices: data.leafToPathIndices,
  };

  fs.writeFile(
    "daohacknew.json",
    JSON.stringify(newDaohackGroup),
    function (err) {
      if (err) throw err;
      console.log("complete");
    }
  );
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
