export type HashedData = {
  msg: string;
  msgType: "MESSAGE" | "REPLY" | "UPVOTE";
  replyId: string | null;
  pubNullifier: string;
};

export const reputationToRoleText = (reputation: number) => {
  if (reputation < 100) {
    return "A Magician";
  } else if (reputation < 200) {
    return "A Wizard";
  } else if (reputation < 300) {
    return "An Alchemist";
  } else {
    return "A Sorcerer";
  }
};
