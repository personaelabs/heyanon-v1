import { Subgraph } from "@semaphore-protocol/subgraph";
import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";

const subgraph = new Subgraph("goerli");

subgraph
  .getGroup("10807", { members: true, verifiedProofs: true })
  .then((group) => {
    console.log(group);
    let groupObj = new Group(parseInt(group.merkleTree.depth));
    console.log(group.members.length);

    let [nullifier, trapdoor] =
      "17024c2ae3c3abb53b796e3bbd0d328498514405ca7ac50226cf7429af48c1_8183d41d9d8d119e015d240ac4378a36cc6658c9d8431c221df690db968c63".split(
        "_"
      );

    let identityObj = new Identity(JSON.stringify([nullifier, trapdoor]));
    let identityCommitment = identityObj.generateCommitment();
    console.log(identityCommitment);
    console.log(group.members);
  });
