import { create } from "ipfs-http-client";

export async function postToIpfs(message: string) {
  const ipfs = create({ host: "localhost", port: 5001, protocol: "http" });

  // TODO: pin on pinata?
  const { cid } = await ipfs.add(message);
  return cid;
}
