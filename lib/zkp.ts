import { groth16 } from "snarkjs";

import { daoHackVkey } from "./vkey";

export async function verifyProof(proof: any, publicSignals: any) {
  const proofVerified = await groth16.verify(daoHackVkey, publicSignals, proof);

  return proofVerified;
}
