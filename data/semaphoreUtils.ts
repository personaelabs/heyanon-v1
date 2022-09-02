import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
// import { groth16 } from "snarkjs";

import { isHexString } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/solidity";
import { formatBytes32String } from "@ethersproject/strings";
import { mainModule } from "process";

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
function generateSignalHash(signal: string): bigint {
  if (!isHexString(signal, 32)) {
    signal = formatBytes32String(signal);
  }

  return BigInt(keccak256(["bytes32"], [signal])) >> BigInt(8);
}

function generateProof(
  identity: Identity,
  groupOrMerkleProof: Group | MerkleProof,
  externalNullifier: BigNumberish,
  signal: string,
  snarkArtifacts?: SnarkArtifacts
) {
  const commitment = identity.generateCommitment();

  let merkleProof: MerkleProof;

  if ("depth" in groupOrMerkleProof) {
    const index = groupOrMerkleProof.indexOf(commitment);

    if (index === -1) {
      throw new Error("The identity is not part of the group");
    }

    merkleProof = groupOrMerkleProof.generateProofOfMembership(index);
  } else {
    merkleProof = groupOrMerkleProof;
  }

  return {
    identityTrapdoor: identity.getTrapdoor().toString(),
    identityNullifier: identity.getNullifier().toString(),
    treePathIndices: merkleProof.pathIndices.map((el) => el.toString()),
    treeSiblings: merkleProof.siblings.map((el) => el.toString()),
    externalNullifier,
    signalHash: generateSignalHash(signal).toString(),
  };
}

function createIdentityCommitments(n: number): bigint[] {
  const identityCommitments: bigint[] = [];

  for (let i = 0; i < n; i++) {
    const identity = new Identity(i.toString());
    const identityCommitment = identity.generateCommitment();

    identityCommitments.push(identityCommitment);
  }

  return identityCommitments;
}

function main() {
  const people = createIdentityCommitments(100);
  let group = new Group(20);
  group.addMembers(people);

  console.log(
    JSON.stringify(
      generateProof(new Identity("50"), group, "1", "I have this question")
    )
  );
}

main();
