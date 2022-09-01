import got from "got";
import crypto from "crypto";
import OAuth from "oauth-1.0a";
import { Credential } from "@prisma/client";

const manageTweetsURL = "https://api.twitter.com/2/tweets";

type TwitResponse = {
  statusCode: number;
  body: {
    data: {
      id: string;
    };
  };
};

function getAuthHeader(credential: Credential, endpointURL: string) {
  const oauth = new OAuth({
    consumer: {
      key: credential.twit_consumer_key!,
      secret: credential.twit_consumer_secret!,
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
        key: credential.twit_access_token!,
        secret: credential.twit_access_secret!,
      }
    )
  );
}

async function postTweet(
  message: string,
  credential: Credential,
  replyId?: string
) {
  const authHeader = getAuthHeader(credential, manageTweetsURL);

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
    const tweetURL = `https://twitter.com/${credential.twitter_account}/status/${tweetID}`;
    return tweetURL;
  }
}

export { postTweet };
