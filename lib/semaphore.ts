import { sha3_224 } from "js-sha3";

type BigNumberish = string | bigint;

type SnarkArtifacts = {
  wasmFilePath: string;
  zkeyFilePath: string;
};

type Proof = {
  pi_a: BigNumberish[];
  pi_b: BigNumberish[][];
  pi_c: BigNumberish[];
  protocol: string;
  curve: string;
};

type FullProof = {
  proof: Proof;
  publicSignals: PublicSignals;
};

type PublicSignals = {
  merkleRoot: BigNumberish;
  nullifierHash: BigNumberish;
  signalHash: BigNumberish;
  externalNullifier: BigNumberish;
};

/**
 * Hashes a signal string with Keccak256.
 * @param signal The Semaphore signal.
 * @returns The signal hash.
 */
export function generateSignalHash(signal: string): bigint {
  return BigInt("0x" + sha3_224(signal));
}
