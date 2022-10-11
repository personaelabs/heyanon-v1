export type HashedData = {
  msg: string;
  msgType: "MESSAGE" | "REPLY";
  replyTweetId: string | null;
  pubNullifier: string;
};
