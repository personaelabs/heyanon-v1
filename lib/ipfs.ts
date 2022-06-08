import { create, IPFS } from "ipfs-core";

let ipfs: IPFS;

export async function postToIpfs(message: string) {
  if (!ipfs) {
    console.log("Creating IPFS node...");
    ipfs = await create();
  }

  // TODO: pin on pinata?
  const { cid } = await ipfs.add(message);
  return cid;
}
