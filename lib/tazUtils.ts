import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export type HashedData = {
  msg: string;
  msgType: "MESSAGE" | "REPLY";
  replyTweetId: string | null;
  pubNullifier: string;
};

const PAGE_SIZE = 1000;

export default async function request(
  url: string,
  config?: AxiosRequestConfig
): Promise<any> {
  const { data }: AxiosResponse<any> = await axios.post(url, config!.data);
  return data?.data;
}

export async function getGroupIdentities() {
  let lastRecordId = -1;
  let members = [];
  const allMembers = [];
  let identityCommitments = [];

  do {
    console.log(
      `SUBGRAPHS | getGroupIdentities | lastRecordId: ${lastRecordId}, members.length: ${members.length}, allMembers.length: ${allMembers.length}`
    );

    const config: AxiosRequestConfig = {
      method: "post",
      data: JSON.stringify({
        query: `
                        {
                            members(
                            where: {group_: {id: "10807"}, index_gt: ${lastRecordId}}
                            orderBy: index
                            first: ${PAGE_SIZE}
                            ) {
                            identityCommitment
                            index
                            }
                        }`,
      }),
    };

    ({ members } = await request(
      "https://api.thegraph.com/subgraphs/name/semaphore-protocol/goerli",
      config
    ));
    if (members.length) {
      lastRecordId = members[members.length - 1].index;
    }
    allMembers.push(...members);
  } while (members.length === PAGE_SIZE);

  if (allMembers.length > 0) {
    identityCommitments = allMembers.map((x) => x.identityCommitment);
  }

  return identityCommitments;
}
