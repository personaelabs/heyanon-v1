import { ethers } from "ethers";
import { SetStateAction } from "react";
import { MerkleTree } from "../merkleTree";
import { Stage } from "./proofStages";
import { setupWeb3 } from "./setup";

declare let window: any;
let signer: any, provider: any, network: any;

export function changeNetworkName(network: any) {
  switch (network.chainId) {
    case 1:
      network.name = "mainnet";
      return network;
    default:
      return network;
  }
}

const DOMAIN = {
  name: "heyanon",
  version: "1",
  chainId: 1,
  verifyingContract: "0x0000000000000000000000000000000000000000",
};
const TYPES = {
  Message: [
    { name: "platform", type: "string" },
    { name: "type", type: "string" },
    { name: "contents", type: "string" },
  ],
};

export const getProvider = () => provider;
export const getSigner = () => signer;
export const getNetwork = () => network;

export const userConnectToMetamask = async (
  merkleTree: MerkleTree | undefined,
  setSigner: (value: any) => void,
  setAddress: (value: SetStateAction<string>) => void,
  setStage: (value: SetStateAction<Stage>) => void
) => {
  const { provider, signer, network } = await setupWeb3();
  setSigner(signer);
  const addr = await signer.getAddress();
  setAddress(addr);
  console.log(addr, merkleTree?.leafToPathElements)
  if (!(BigInt(addr).toString() in merkleTree!.leafToPathElements)) {
    setStage(Stage.NEWADDRESS);
  } else {
    setStage(Stage.MSGTYPE);
  }
};
