import { groth16 } from "snarkjs";

import { vkey } from "./vkey";
import { merkleTree } from "./merkleTree";

// TODO: we can set the circuit we're using in a variable and have that propagate down to
// all of these variable names
// I should also not put this stuff in version control...
const zkeyPath = "/dummy.zkey";
const wasmPath = "/dummy.wasm";

export async function verifyProof(proof: any, publicSignals: any) {
  const proofVerified = await groth16.verify(vkey, publicSignals, proof);

  return proofVerified;
}
