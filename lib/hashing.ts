import { _TypedDataEncoder } from "ethers/lib/utils";

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

export type EIP712Value = {
  platform: string;
  type: string;
  contents: string;
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

export function eip712MsgHash(value: EIP712Value) {
  return _TypedDataEncoder.hash(DOMAIN, TYPES, value);
}
