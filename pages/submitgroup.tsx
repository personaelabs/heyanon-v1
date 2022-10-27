import { NextPage } from "next";
import { useRef, useState } from "react";
import Papa from "papaparse";
import { ethers } from "ethers";
import { checkGroupExists, createGroupEntry, formatCreateTreeJSONBody, uploadTree } from "../lib/submitgroup";
import { GroupSubmissionDescription } from "../components/submitgroup/GroupSubmissionDescription";
import { TreeError, TreeState, TreeStateLog } from "../components/submitgroup/TreeStateLog";
import { SubmitButton } from "../components/submitgroup/SubmitButton";
import { TextInput } from "../components/submitgroup/TextInput";
import { TreeInfo } from "../components/submitgroup/TreeInfo";
import { generateTree } from "../lib/merkleTree";
import Head from "next/head";

export const textOnUpload = "Submit";

const SubmitGroup: NextPage = () => {
    const [ groupId, setgroupId ] = useState<null | string>(null);
    const [ groupName, setgroupName ] = useState<null | string>(null);
    const [ groupTwitterAcc, setgroupTwitterAcc ] = useState<null | string>(null);
    const [ groupDescription, setgroupDescription ] = useState<null | string>(null);
    const [ groupUsefulness, setgroupUsefulness ] = useState<null | string>(null);
    const [ generationMethod, setgenerationMethod ] = useState<null | string>(null);
    const [ treeState, settreeState ] = useState<TreeState | TreeError>(TreeState.TREE_NOT_SUBMITTED);
    const [ disableSubmit, setdisableSubmit ] = useState<boolean>(false);
    const [ buttonText, setbuttonText ] = useState("Submit");
    const [ addresses, setaddresses ] = useState<string[] | null>(null);
    const refInputCsv = useRef<null | HTMLInputElement>(null);

    // @dev: any should not be provided as type for tree here
    const [ tree, settree ] = useState<any | null>(null);

    const loadCsv = () => {
        const inputCsv = refInputCsv.current ? refInputCsv.current.files![ 0 ] : null;
        if (inputCsv) {
            Papa.parse(inputCsv, {
                header: false,
                complete (results: any, file: any) {
                    let parsedAddresses: string[] | null = [];
                    for (let row of results.data) {
                        const address = row[ 0 ];
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
                }
            });
        }
    };

    const onClickSubmit = async (e: Event) => {
        e.preventDefault();
        if (groupId && groupName && groupTwitterAcc && groupDescription && groupUsefulness && generationMethod && addresses) {
            setdisableSubmit(true);
            const entry = {
                groupId,
                groupName,
                twitterAccount: groupTwitterAcc,
                description: groupDescription,
                whyUseful: groupUsefulness,
                howGenerated: generationMethod,
                secretIndex: 42
            };
            settreeState(TreeState.TREE_PRECHECKS);
            const groupExists = await (await checkGroupExists(entry, "/api/group/exists")).json();
            if (groupExists.error) {
                settreeState(TreeError.SERVER_ERROR);
            }
            else if (groupExists.groupExists) {
                settreeState(TreeError.GROUP_EXISTS);
            }
            else if (groupExists.twitterExists) {
                settreeState(TreeError.TWITTER_EXISTS);
            }
            else {
                settreeState(TreeState.TREE_BUILDING);
                const tree = await generateTree(entry, addresses);
                settreeState(TreeState.TREE_CREATING_ENTRY);
                const groupEntry = await (await createGroupEntry(tree, "/api/group/create")).json();
                const formattedTree = formatCreateTreeJSONBody(tree);
                // @dev api route name is imprecise since we create multiple leaves
                settreeState(TreeState.TREE_UPLOADING_USERS);
                const uploadedTree = await uploadTree(formattedTree.leafToPathElements, formattedTree.leafToPathIndices, groupEntry.groupId, "/api/tree/create");
                settreeState(TreeState.TREE_UPLOADED);
                settree(tree);
                setbuttonText(textOnUpload);
            }
            setdisableSubmit(false);
        }
    };

    return (
        <div className="scroll-smooth">
            <Head>
                <title>heyanon!</title>
                <link rel="icon" href="/heyanon.ico" />
            </Head>
            <GroupSubmissionDescription></GroupSubmissionDescription>
            <div className="flex text-center justify-center mb-10">
                <form action="">
                    <TextInput initialState={groupId} stateSetter={setgroupId} descriptionTextInput='Enter a group id: '></TextInput>
                    <TextInput initialState={groupName} stateSetter={setgroupName} descriptionTextInput='Group name:'></TextInput>
                    <TextInput initialState={groupTwitterAcc} stateSetter={setgroupTwitterAcc} descriptionTextInput='@Twitter account'></TextInput>
                    <TextInput initialState={groupDescription} stateSetter={setgroupDescription} descriptionTextInput='Short group description:'></TextInput>
                    <TextInput initialState={groupUsefulness} stateSetter={setgroupUsefulness} descriptionTextInput='Explain why this group matters:'></TextInput>
                    <TextInput initialState={generationMethod} stateSetter={setgenerationMethod} descriptionTextInput='How can we reproduce this group?'></TextInput>
                    <div className='mb-5'>1-column, no header keccak addresses csv of your heyanon group</div>
                    <input onChange={loadCsv} ref={refInputCsv} type="file" id="ecdsaAddresses" accept='.csv' />
                    {/** preventing default submit behaviour on button for now */}
                </form>
            </div>
            <SubmitButton text={buttonText} disabled={disableSubmit} onClick={async (e) => await onClickSubmit(e)}></SubmitButton>
            <TreeStateLog treeState={treeState}></TreeStateLog>
            {tree && <TreeInfo treeDetails={tree}></TreeInfo>}
        </div>
    );
};

export default SubmitGroup;