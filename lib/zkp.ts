import { groupMessageVkey } from "./vkey";

const snarkjs = require("snarkjs");

export async function verifyProof(proof: any, publicSignals: any) {
  const proofVerified = await snarkjs.groth16.verify(
    groupMessageVkey,
    publicSignals,
    proof
  );

  return proofVerified;
}
