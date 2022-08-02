import { postTweet } from "../../lib/backend/twitter";
import { postToIpfs } from "../../lib/backend/ipfs";

let Airtable = require("airtable");
const airtableKey = process.env.AIRTABLE_KEY;
var base = new Airtable({ apiKey: airtableKey }).base("appG8N4VYZAVSUYse");

async function modSubmit(
  groupId: string,
  ipfsData: string,
  twitterMessage: string,
  twitterType: string,
  twitterSecretIndex: number,
  twitterAccount: string,
  twitterReplyId: string
) {
  base("Posts").create(
    [
      {
        fields: {
          ipfsData: ipfsData,
          twitterMessage: twitterMessage,
          twitterType: twitterType,
          twitterSecretIndex: twitterSecretIndex,
          groupId: groupId,
          twitterAccount: twitterAccount,
          twitterReplyId: twitterReplyId,
          "Vote 1": "Not reviewed",
          "Vote 2": "Not reviewed",
        },
      },
    ],
    function (err: Error, records: Array<any>) {
      if (err) {
        console.error(err);
        return;
      }
      records.forEach(function (record) {
        console.log(record.getId());
      });
    }
  );
}

async function modApprove() {
  base("Posts")
    .select({
      filterByFormula: "AND({Vote 1} = 'Approved', {Vote 2} = 'Approved')",
    })
    .eachPage(
      function page(records: Array<any>, fetchNextPage: any) {
        records.forEach(async function (record) {
          const cid = await postToIpfs(record.get("ipfsData"));
          console.log(`Posted to ipfs: ${cid.toString()}`);

          record.get("twitterType") === "post"
            ? await postTweet(
                `${record.get("twitterMessage")}
  
heyanon.xyz/verify/${cid.toString()}`,
                record.get("twitterSecretIndex"),
                record.get("twitterAccount")
              )
            : await postTweet(
                `${record.get("twitterMessage")}
  
heyanon.xyz/verify/${cid.toString()}`,
                record.get("twitterSecretIndex"),
                record.get("twitterAccount"),
                record.get("twitterReplyId")
              );

          base("Posts").update([
            {
              id: record.id,
              fields: {
                "Vote 1": "Posted",
                "Vote 2": "Posted",
              },
            },
          ]);

          console.log("Posted", record);
        });

        fetchNextPage();
      },
      function done(err: Error) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
}

export { modSubmit, modApprove };
