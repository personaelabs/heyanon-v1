// TODO: we can set the circuit we're using in a variable and have that propagate down to
// all of these variable names

import { merkleTree } from "../merkleTree";

const localforage = require("localforage");
const snarkjs = require("snarkjs");

const loadURL = "https://d27ahxc61uj811.cloudfront.net/";

async function downloadFromFilename(filename: string) {
  const link = loadURL + filename;
  try {
    const zkeyResp = await fetch(link, {
      method: 'GET'
    });
    const zkeyBuff = await zkeyResp.arrayBuffer();
    await localforage.setItem(
      filename,
      zkeyBuff
    );
    console.log(
      `Storage of ${filename} successful!`
    );
  } catch (e) {
    console.log(
      `Storage of ${filename} unsuccessful, make sure IndexedDB is enabled in your browser.`
    );
  }
}

export const downloadProofFiles = async function (filename: string) {
  const zkeySuffix = ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  const filePromises = [];
  for (const c of zkeySuffix) {
    const item = await localforage.getItem(`${filename}.zkey${c}`);
    if (item) {
      console.log(`${filename}.zkey${c} already exists!`);
      continue;
    }
    filePromises.push(downloadFromFilename(`${filename}.zkey${c}`));
  }
  await Promise.all(filePromises);
}

// NOTE: assumes snarkjs.min.js is loaded
export async function generateProof(input: any, filename: string) {
  // TODO: figure out how to generate this s.t. it passes build
  console.log("generating proof for input");
  console.log(input);
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    `./${filename}.wasm`,
    `${filename}.zkey`
  );
  console.log(`Generated proof ${JSON.stringify(proof)}`);

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

export function buildNoSigInput(
  address: string,
  pubkey: string,
  msghash: string,
  sig: string
) {
  return {
    root: merkleTree.root,
    branch: merkleTree.addressToBranch[parseInt(address)],
    branch_side: merkleTree.addressToBranchIndices[parseInt(address)],
    pubkey: pubkeyStrToXY(pubkey).map(bigintToTuple),
  };
}
