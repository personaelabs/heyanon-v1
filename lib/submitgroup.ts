//@ts-ignore
import { buildTreePoseidon } from "merkle-poseidon/lib";
import { ethers } from "ethers";
import Papa from "papaparse";
import { MutableRefObject, Dispatch, SetStateAction } from "react";
import { TreeState, TreeError } from "../components/submitgroup/TreeStateLog";

export const checkGroupExists = async (dbEntry: any, route: string) => {
  const responseExists = await fetch(route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      twitterAccount: dbEntry.twitterAccount,
      groupName: dbEntry.groupName,
    }),
  });
  return responseExists;
};

export const uploadTree = async (
  leafToPathElements: { user: string[] },
  leafToPathIndices: { user: string[] },
  groupId: number,
  route: string
) => {
  const responseTree = await fetch(route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      leafToPathElements,
      leafToPathIndices,
      groupId,
    }),
  });
  return responseTree;
};

export const createGroupEntry = async (tree: any, route: string) => {
  const treeCreated = await fetch(route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      root: tree.root.toString(),
      approved: tree.approved,
      twitter_account: tree.twitterAccount,
      abbr_name: tree.groupId,
      full_name: tree.groupName,
      how_generated: tree.howGenerated,
      moderation_status: tree.moderationStatus,
      description: tree.description,
      why_useful: tree.whyUseful,
      static: true,
      proof_id: 1,
    }),
  });
  return treeCreated;
};

export const formatCreateTreeJSONBody = (body: any) => {
  // JSON stringify is not able to serialize bigint
  body.root = body.root.toString();
  const addresses = Object.keys(body.leafToPathElements);
  addresses.map((address) => {
    // path element h(a, b) converted cast to string from bigint
    body.leafToPathElements[address] = body.leafToPathElements[address].map(
      (element: bigint) => element.toString()
    );
    // path element h(a, b) converted cast to string from number
    body.leafToPathIndices[address] = body.leafToPathIndices[address].map(
      (index: number) => index.toString()
    );
  });
  return body;
};

export const generateTree = async (
  treeInfo: TreeDetails,
  addresses: string[]
) => {
  // @dev: for now: static, proof, credential id are static
  const tree: any = await buildTreePoseidon(addresses, 13, 30, 0n);
  tree["groupId"] = treeInfo.groupId;
  tree["groupName"] = treeInfo.groupName;
  tree["twitterAccount"] = treeInfo.twitterAccount;
  tree["description"] = treeInfo.description;
  tree["whyUseful"] = treeInfo.whyUseful;
  tree["howGenerated"] = treeInfo.howGenerated;
  tree["secretIndex"] = treeInfo.secretIndex;
  tree["approved"] = true;
  tree["moderationStatus"] = "NONE";
  tree["static"] = true;
  tree["proofId"] = 1;
  return tree;
};

export const loadAddressCsv = (
  csvUploadElement: MutableRefObject<HTMLInputElement | null>,
  settreeState: Dispatch<SetStateAction<TreeState | TreeError>>,
  setaddresses: Dispatch<SetStateAction<string[] | null>>
) => {
  const inputCsv = csvUploadElement.current
    ? csvUploadElement.current.files![0]
    : null;
  if (inputCsv) {
    Papa.parse(inputCsv, {
      header: false,
      complete(results: any, file: any) {
        let parsedAddresses: string[] | null = [];
        for (let row of results.data) {
          const address = row[0];
          if (ethers.utils.isAddress(address)) {
            parsedAddresses.push(address);
          } else {
            parsedAddresses = null;
            settreeState(TreeError.INVALID_ADDRESS);
            break;
          }
        }
        // @dev parsedAddresses will be null if any address is not a valid keccak one
        setaddresses(parsedAddresses);
        if (parsedAddresses) {
          settreeState(TreeState.TREE_NOT_SUBMITTED);
        }
      },
    });
  }
};

export const onClickUpload = async (
  e: Event,
  addresses: string[] | null,
  userEntry: GroupEntry,
  setdisableSubmit: Dispatch<SetStateAction<boolean>>,
  settreeState: Dispatch<SetStateAction<TreeState | TreeError>>,
  settree: Dispatch<any>,
  setbuttonText: Dispatch<SetStateAction<string>>
) => {
  e.preventDefault();
  const textOnUpload = "Submit";

  const noEmptyFields = Object.values(userEntry).every(
    (entry) => entry !== null && entry !== ""
  );
  if (noEmptyFields && addresses) {
    setdisableSubmit(true);
    const entry = {
      groupId: userEntry.groupId!,
      groupName: userEntry.groupName!,
      twitterAccount: userEntry.groupTwitterAcc!,
      description: userEntry.groupDescription!,
      whyUseful: userEntry.groupUsefulness!,
      howGenerated: userEntry.generationMethod!,
      secretIndex: 42,
    };
    settreeState(TreeState.TREE_PRECHECKS);
    const groupExists = await (
      await checkGroupExists(entry, "/api/group/exists")
    ).json();
    if (groupExists.error) {
      settreeState(TreeError.SERVER_ERROR);
    } else if (groupExists.groupExists) {
      settreeState(TreeError.GROUP_EXISTS);
    } else if (groupExists.twitterExists) {
      settreeState(TreeError.TWITTER_EXISTS);
    } else {
      settreeState(TreeState.TREE_BUILDING);
      const tree = await generateTree(entry, addresses);
      settreeState(TreeState.TREE_CREATING_ENTRY);
      const groupEntry = await (
        await createGroupEntry(tree, "/api/group/create")
      ).json();
      if (groupEntry.error) {
        settreeState(TreeError.SERVER_ERROR);
      } else {
        const formattedTree = formatCreateTreeJSONBody(tree);
        // @dev api route name is imprecise since we create multiple leaves
        settreeState(TreeState.TREE_UPLOADING_USERS);
        const uploadedTree = await (
          await uploadTree(
            formattedTree.leafToPathElements,
            formattedTree.leafToPathIndices,
            groupEntry.groupId,
            "/api/tree/create"
          )
        ).json();
        if (uploadedTree.error) {
          settreeState(TreeError.SERVER_ERROR);
        } else {
          settreeState(TreeState.TREE_UPLOADED);
          settree(tree);
          setbuttonText(textOnUpload);
        }
      }
    }
  }
  setdisableSubmit(false);
};
