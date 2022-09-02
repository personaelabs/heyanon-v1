import { PrismaClient } from "@prisma/client";
import { sbcSecrets } from "./sbcSecrets";
import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";
import { poseidon } from "circomlibjs";

const prisma = new PrismaClient();

async function main() {
  // create identities + groups
  const identityCommitments: string[] = [];

  for (let i = 0; i < 200; i++) {
    const identity = new Identity(sbcSecrets[i]);
    const identityCommitment = identity.generateCommitment();
    identityCommitments.push(identityCommitment.toString());
  }

  let sbcSemaphoreGroup = new Group(20);
  sbcSemaphoreGroup.addMembers(identityCommitments);

  // create group if it doesn't exist
  let sbcGroup = await prisma.group.findUnique({
    where: {
      abbr_name: "sbc",
    },
  });

  if (!sbcGroup) {
    sbcGroup = await prisma.group.create({
      data: {
        root: sbcSemaphoreGroup.root.toString(),
        approved: true,
        abbr_name: "sbc",
        full_name: "SBC ZK Magicians",
        how_generated: "By Vivek",
        moderation_status: "NONE",
        description: "Semaphore group for all SBC ZK Workshop attendees",
        why_useful: "MVP of in-person heyanon groups",
        static: true,
        proof_id: 2,
        credential_id: 5, // use heyanontest initially
        ext_nullifier: "123",
      },
    });
  }

  for (let i = 0; i < 200; i++) {
    console.log(i);
    const identity = new Identity(sbcSecrets[i]);
    const idc = identity.generateCommitment();

    // create new user
    let user = await prisma.user.findUnique({
      where: {
        key: idc.toString(),
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          key: idc.toString(),
          site_admin: false,
        },
      });
    }

    // create new leaf
    let leafCount = await prisma.leaf.count({
      where: {
        user_id: user.id,
      },
    });

    if (leafCount === 0) {
      const idcIndex = sbcSemaphoreGroup.indexOf(idc);
      const merkleProof = sbcSemaphoreGroup.generateProofOfMembership(idcIndex);
      const leaf = await prisma.leaf.create({
        data: {
          path: merkleProof.siblings.map((el) => el.toString()),
          indices: merkleProof.pathIndices.map((el) => el.toString()),
          user_id: user.id,
          group_id: sbcGroup.id,
        },
      });
    }

    // create new nullifier
    const pub_nullifier = poseidon([
      sbcGroup.ext_nullifier,
      identity.getNullifier(),
    ]).toString();
    let nullifier = await prisma.nullifier.findFirst({
      where: {
        value: pub_nullifier,
      },
    });

    if (!nullifier) {
      let reputation;
      if (i < 150) reputation = 50;
      else if (i < 175) reputation = 150;
      else if (i < 190) reputation = 250;
      else reputation = 500;

      nullifier = await prisma.nullifier.create({
        data: {
          value: pub_nullifier,
          reputation: reputation,
          group_id: sbcGroup.id,
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
