import got from "got";
import crypto from "crypto";
import OAuth from "oauth-1.0a";

const consumerKeys = process.env.TWIT_CONSUMER_KEY!.split(" ");
const consumerSecrets = process.env.TWIT_CONSUMER_SECRET!.split(" ");
const accessTokens = process.env.TWIT_ACCESS_TOKEN!.split(" ");
const accessSecrets = process.env.TWIT_ACCESS_SECRET!.split(" ");

const manageTweetsURL = "https://api.twitter.com/2/tweets";

type TwitResponse = {
  statusCode: number;
  body: {
    data: {
      id: string;
    };
  };
};

function getAuthHeader(secretIndex: number, endpointURL: string) {
  const oauth = new OAuth({
    consumer: {
      key: consumerKeys[secretIndex],
      secret: consumerSecrets[secretIndex],
    },
    signature_method: "HMAC-SHA1",
    hash_function: (baseString, key) =>
      crypto.createHmac("sha1", key).update(baseString).digest("base64"),
  });

  return oauth.toHeader(
    oauth.authorize(
      {
        url: endpointURL,
        method: "POST",
      },
      {
        key: accessTokens[secretIndex],
        secret: accessSecrets[secretIndex],
      }
    )
  );
}

async function postTweet(
  message: string,
  secretIndex: number,
  twitterAccount: string,
  replyId?: string
) {
  const authHeader = getAuthHeader(secretIndex, manageTweetsURL);

  let json: any = { text: message };
  if (replyId !== undefined) {
    json["reply"] = { in_reply_to_tweet_id: replyId };
  }
  let resp: TwitResponse = await got.post(manageTweetsURL, {
    json,
    responseType: "json",
    headers: {
      Authorization: authHeader["Authorization"],
      "content-type": "application/json",
      accept: "application/json",
    },
  });

  if (resp.statusCode !== 201) {
    throw new Error("error posting tweet");
  } else {
    const tweetID = resp.body.data.id;
    const tweetURL = `https://twitter.com/${twitterAccount}/status/${tweetID}`;
    return tweetURL;
  }
}

export { postTweet };
