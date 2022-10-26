import { PrismaClient } from "@prisma/client";

export const formatTestTreeEntry = (
  groupTemplateJSON: groupTemplateJSON,
  prefix: string
): TreeDetails => {
  /**
   * small utils for formatting a template json for denoting test data
   * hopefully until a test env exists on HeyAnon
   */
  const randint = Math.floor(Math.random() * 10000);
  const testPrefix = `${prefix}_${randint}`;
  const dbEntry = Object.entries(groupTemplateJSON).map((o) => [
    o[0],
    `${testPrefix}_${o[1]}`,
  ]);
  return Object.fromEntries(dbEntry);
};

export const getUserId = async (address: string, prisma: PrismaClient) => {
  const user = prisma.user.findUnique({
    where: {
      key: address,
    },
  });
  return user;
};

export const createUser = async (address: string, prisma: PrismaClient) => {
  const user = await prisma.user.create({
    data: {
      key: address,
      site_admin: false,
    },
  });
  return user;
};

export const createLeaf = async (
  path: string[],
  indices: string[],
  userId: number,
  groupId: number,
  prisma: PrismaClient
) => {
  const leaf = await prisma.leaf.create({
    data: {
      path: path,
      indices: indices,
      user_id: userId, 
      group_id: groupId
    }
  })
  return leaf
};
export const twitterAccountExists = async (
  twitterAccount: string,
  prisma: PrismaClient
) => {
  const foundAccount = await prisma.credential.findFirst({
    where: {
      twitter_account: twitterAccount,
    },
  });
  return foundAccount != null;
};

export const groupNameExists = async (
  groupName: string,
  prisma: PrismaClient
) => {
  /**
   * Check whether an entry for group is already within db
   */
  const foundGroupName = await prisma.group.findFirst({
    where: {
      abbr_name: groupName,
    },
  });
  return foundGroupName != null;
};
