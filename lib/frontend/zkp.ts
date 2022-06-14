// TODO: we can set the circuit we're using in a variable and have that propagate down to
// all of these variable names

import { merkleTree } from "../merkleTree";

// I should also not put this stuff in version control...
const zkeyPath = "/dao_hack_confession.zkey";
const wasmPath = "/dao_hack_confession.wasm";

// NOTE: assumes snarkjs.min.js is loaded
export async function generateProof(input: any) {
  // TODO: figure out how to generate this s.t. it passes build
  console.log("generating proof for input");
  console.log(input);
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

function bigIntToArray(n: number, k: number, x: bigint) {
  let divisor = 1n;
  for (var idx = 0; idx < n; idx++) {
    divisor = divisor * 2n;
  }

  let ret = [];
  var x_temp = BigInt(x);
  for (var idx = 0; idx < k; idx++) {
    ret.push(x_temp % divisor);
    x_temp = x_temp / divisor;
  }
  return ret;
}

// NOTE: taken from generation code in dizkus-circuits tests
function pubkeyToXYArrays(pk: string) {
  const XArr = bigIntToArray(64, 4, BigInt("0x" + pk.slice(4, 4 + 64))).map(
    (el) => el.toString()
  );
  const YArr = bigIntToArray(64, 4, BigInt("0x" + pk.slice(68, 68 + 64))).map(
    (el) => el.toString()
  );

  return [XArr, YArr];
}

// NOTE: taken from generation code in dizkus-circuits tests
function sigToRSArrays(sig: string) {
  const rArr = bigIntToArray(64, 4, BigInt("0x" + sig.slice(2, 2 + 64))).map(
    (el) => el.toString()
  );
  const sArr = bigIntToArray(64, 4, BigInt("0x" + sig.slice(66, 66 + 64))).map(
    (el) => el.toString()
  );

  return [rArr, sArr];
}

export function buildInput(
  address: string,
  pubkey: string,
  msghash: string,
  sig: string
) {
  const [r, s] = sigToRSArrays(sig);

  return {
    root: merkleTree.root,
    branch: merkleTree.addressToBranch[parseInt(address)],
    branch_side: merkleTree.addressToBranchIndices[parseInt(address)],

    r,
    s,
    msghash: bigIntToArray(64, 4, BigInt(msghash)),

    pubkey: pubkeyToXYArrays(pubkey),
  };
}
