export const checkGroupExists = async (dbEntry: any, route: string) => {
  const responseExists = await fetch(route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      twitterAccount: dbEntry.twitterAccount,
      groupName: dbEntry.groupName,
    }),
  });
  return responseExists;
};

export const uploadTree = async (
  leafToPathElements: { user: string[] },
  leafToPathIndices: { user: string[] },
  groupId: number, 
  route: string
) => {
  await fetch(route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      leafToPathElements,
      leafToPathIndices,
      groupId
    }),
  });
};

export const createGroupEntry = async (tree: any, route: string) => {
  const treeCreated = await fetch(route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      root: tree.root.toString(),
      approved: tree.approved,
      twitter_account: tree.twitterAccount,
      abbr_name: tree.groupId,
      full_name: tree.groupName,
      how_generated: tree.howGenerated,
      moderation_status: tree.moderationStatus,
      description: tree.description,
      why_useful: tree.whyUseful,
      static: true,
      proof_id: 1,
    }),
  });
  return treeCreated;
};
