import { daoHackVkey } from "./vkey";

const snarkjs = require("snarkjs");

export async function verifyProof(proof: any, publicSignals: any) {
  const proofVerified = await snarkjs.groth16.verify(
    daoHackVkey,
    publicSignals,
    proof
  );

  return proofVerified;
}
