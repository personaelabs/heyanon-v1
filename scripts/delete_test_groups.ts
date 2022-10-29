import { Group, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const testGroups = await prisma.$queryRaw<
    Group[]
  >`SELECT * FROM "Group" WHERE abbr_name LIKE 'test_%' OR id > 22;`;

  const deletedTestGroup = 
    testGroups.map(async (group) => {
      const deleteLeaves = await prisma.leaf.deleteMany({
        where: {
          group_id: group.id,
        },
      });

      console.log(`Deleted leaves for ${group.id} - ${group.abbr_name}`);

      const deleteGroup = await prisma.group.delete({
        where: {
          abbr_name: group.abbr_name,
        },
      });

      console.log(`Deleted group for ${group.id} - ${group.abbr_name}`);

      const deleteCredentials = await prisma.credential.delete({
        where: {
          id: group.credential_id,
        },
      });

      console.log(`Deleted credentials for ${group.id} - ${group.abbr_name}`);
    })
  
}

main();
