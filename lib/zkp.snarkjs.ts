const snarkjs = require("snarkjs");
import { Proof } from "@prisma/client";

export async function generateProof(input: any, proofType: Proof) {
    console.log("generating proof for input");
    console.log(input);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      `../${proofType.filename}.wasm`,
      `${proofType.filename}.zkey`
    );
    console.log(`Generated proof ${JSON.stringify(proof)}`);
  
    return {
      proof,
      publicSignals,
    };
  }
  
  export async function verifyProof(
    proof: any,
    publicSignals: any,
    proofType: Proof
  ) {
    const proofVerified = await snarkjs.groth16.verify(
      JSON.parse(proofType.vkey),
      publicSignals,
      proof
    );
  
    return proofVerified;
  }