// TODO: we can set the circuit we're using in a variable and have that propagate down to
// all of these variable names
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

// NOTE: dummy input for now
// TODO: get pubkey, perhaps using https://github.com/ethers-io/ethers.js/issues/447
// TODO: pull in msghash as well
export function buildInput(address: string, signature: string | null) {
  return {
    root: 0,
    branch: [],
    branch_side: [],

    r: [0, 1, 2, 3],
    s: [1, 2, 3, 4],
    msghash: [1, 2, 3, 4],

    pubkey: [
      [1, 2, 3, 4],
      [1, 4, 2, 3],
    ],
  };
}
