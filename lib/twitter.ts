import got from "got";
import crypto from "crypto";
import OAuth from "oauth-1.0a";

const consumerKey = process.env.TWIT_CONSUMER_KEY!;
const consumerSecret = process.env.TWIT_CONSUMER_SECRET!;
const accessToken = process.env.TWIT_ACCESS_TOKEN!;
const accessSecret = process.env.TWIT_ACCESS_SECRET!;

const twitterAccount = "DAOHackGossip";

const oauth = new OAuth({
  consumer: {
    key: consumerKey,
    secret: consumerSecret,
  },
  signature_method: "HMAC-SHA1",
  hash_function: (baseString, key) =>
    crypto.createHmac("sha1", key).update(baseString).digest("base64"),
});

const endpointURL = `https://api.twitter.com/2/tweets`;

const authHeader = oauth.toHeader(
  oauth.authorize(
    {
      url: endpointURL,
      method: "POST",
    },
    {
      key: accessToken,
      secret: accessSecret,
    }
  )
);

// NOTE: currently only works with the keys set in process.env
async function postTweet(message: string) {
  let resp = await got.post(endpointURL, {
    json: { text: message },
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
    const tweetID = resp["body"]["data"]["id"];
    const tweetURL = `https://twitter.com/${twitterAccount}/status/${tweetID}`;
    return tweetURL;
  }
}

export { postTweet };
