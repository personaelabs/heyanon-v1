import * as IPFS from "ipfs-core";

const ipfs = IPFS.create();

// TODO: pin on pinata?
export async function postToIpfs(message: string) {
  const { cid } = await (await ipfs).add(message);
  return cid;
}
