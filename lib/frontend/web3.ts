import { ethers } from "ethers";
import { _TypedDataEncoder } from "ethers/lib/utils";

declare let window: any;
let signer: any, provider: any, network: any;

function changeNetworkName(network: any) {
  switch (network.chainId) {
    case 1:
      network.name = "mainnet";
      return network;
    default:
      return network;
  }
}

export async function setupWeb3() {
  console.log("Attempting to set up web3");
  provider = new ethers.providers.Web3Provider(window.ethereum);
  console.log(provider);
  await provider.send("eth_requestAccounts", []);
  const currentNetwork = await provider.getNetwork();
  provider.on("network", (newNetwork: any, oldNetwork: any) => {
    if (oldNetwork) {
      window.location.reload();
      network = changeNetworkName(newNetwork);
    }
  });
  const signer = provider.getSigner();
  return { provider, signer, network: changeNetworkName(currentNetwork) };
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
export async function eip712Sign(
  signer: any,
  msgType: string,
  msgContents: string
) {
  const value = {
    platform: "twitter",
    type: msgType,
    contents: msgContents,
  };
  const signature = await signer._signTypedData(DOMAIN, TYPES, value);
  return signature;
}

export async function eip712MsgHash(msgType: string, msgContents: string) {
  const value = {
    platform: "twitter",
    type: msgType,
    contents: msgContents,
  };
  const msgHash = _TypedDataEncoder.hash(DOMAIN, TYPES, value);

  return msgHash;
}

export const getProvider = () => provider;
export const getSigner = () => signer;
export const getNetwork = () => network;
