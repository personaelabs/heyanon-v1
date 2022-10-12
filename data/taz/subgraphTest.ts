import { Subgraph } from "@semaphore-protocol/subgraph";
import { Group } from "@semaphore-protocol/group";

const subgraph = new Subgraph("goerli");

subgraph
  .getGroup("10807", { members: true, verifiedProofs: true })
  .then((group) => {
    console.log(group);
    let groupObj = new Group(parseInt(group.merkleTree.depth));
    console.log(group.members.length);
  });
