import { create } from "ipfs-http-client";

const infuraProjectId = process.env.INFURA_PROJECT_ID;
const infuraProjectSecret = process.env.INFURA_PROJECT_SECRET;

const auth =
  "Basic " +
  Buffer.from(infuraProjectId + ":" + infuraProjectSecret).toString("base64");

export async function postToIpfs(message: string) {
  const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  // TODO: pin?
  const { cid } = await ipfs.add(message);
  return cid;
}
