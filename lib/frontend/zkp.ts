// TODO: we can set the circuit we're using in a variable and have that propagate down to
// all of these variable names

import { merkleTree } from "../merkleTree";

// I should also not put this stuff in version control...
const zkeyPath = "/dao_hack_confession.zkey";
const wasmPath = "/dao_hack_confession.wasm";

// NOTE: assumes snarkjs.min.js is loaded
export async function generateProof(input: any) {
  console.log(`generating proof for input ${input}`);
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmPath,
    zkeyPath
  );
  console.log(`Generated proof ${JSON.stringify(proof)}`);

  // TODO: should we verify here as well?

  return {
    proof,
    publicSignals,
  };
}

function bigintToTuple(x: bigint) {
  let mod: bigint = 1n;
  for (var idx = 0; idx < 64; idx++) {
    mod = mod * 2n;
  }

  let ret: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n];

  var x_temp: bigint = x;
  for (var idx = 0; idx < ret.length; idx++) {
    ret[idx] = x_temp % mod;
    x_temp = x_temp / mod;
  }
  return ret;
}

function pubkeyStrToXY(pk: string) {
  // remove 0x04, then divide in 2
  let pkUnprefixed = pk.substring(4);

  let xStr = pkUnprefixed.substring(0, 64);
  let yStr = pkUnprefixed.substring(64);

  return [BigInt("0x" + xStr), BigInt("0x" + yStr)];
}

export function buildInput(
  address: string,
  pubkey: string,
  msghash: string,
  sig: string
) {
  // TODO: I don't think this is the right format! verify
  const r = BigInt("0x" + sig.substring(2, 66));
  const s = BigInt("0x" + sig.substring(66, 130));

  return {
    root: merkleTree.root,
    branch: merkleTree.addressToBranch[parseInt(address)],
    branch_side: merkleTree.addressToBranchIndices[parseInt(address)],

    r: bigintToTuple(r),
    s: bigintToTuple(s),
    msghash: bigintToTuple(BigInt(msghash)),

    pubkey: pubkeyStrToXY(pubkey).map(bigintToTuple),
  };
}
