import { NextPage } from "next";
import { useRef, useState } from "react";
import { loadAddressCsv, onClickUpload } from "../lib/submitgroup";
import { GroupSubmissionDescription } from "../components/submitgroup/GroupSubmissionDescription";
import { TreeError, TreeState, TreeStateLog } from "../components/submitgroup/TreeStateLog";
import { SubmitButton } from "../components/submitgroup/SubmitButton";
import { TextInput } from "../components/submitgroup/TextInput";
import { TreeInfo } from "../components/submitgroup/TreeInfo";
import Head from "next/head";


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

    return (
        <div className="scroll-smooth">
            <Head>
                <title>heyanon!</title>
                <link rel="icon" href="/heyanon.ico" />
            </Head>
            <GroupSubmissionDescription></GroupSubmissionDescription>
            <div className="flex text-center justify-center mb-10">
                <form action="">
                    <TextInput initialState={groupId} stateSetter={setgroupId} descriptionTextInput='Enter a group id:'></TextInput>
                    <TextInput initialState={groupName} stateSetter={setgroupName} descriptionTextInput='Group name:'></TextInput>
                    <TextInput initialState={groupTwitterAcc} stateSetter={setgroupTwitterAcc} descriptionTextInput='@Twitter account:'></TextInput>
                    <TextInput initialState={groupDescription} stateSetter={setgroupDescription} descriptionTextInput='Short group description:'></TextInput>
                    <TextInput initialState={groupUsefulness} stateSetter={setgroupUsefulness} descriptionTextInput='Explain why this group matters:'></TextInput>
                    <TextInput initialState={generationMethod} stateSetter={setgenerationMethod} descriptionTextInput='How can we reproduce this group?'></TextInput>
                    <div className='mb-5'>1-column, no header keccak addresses csv of your heyanon group</div>
                    <input onChange={() => loadAddressCsv(refInputCsv, settreeState, setaddresses)} ref={refInputCsv} type="file" id="ecdsaAddresses" accept='.csv' />
                </form>
            </div>
            <SubmitButton text={buttonText} disabled={disableSubmit} onClick={async (e) => await onClickUpload(e, addresses, { groupId, groupName, groupDescription, groupTwitterAcc, groupUsefulness, generationMethod }, setdisableSubmit, settreeState, settree, setbuttonText)}></SubmitButton>
            <TreeStateLog treeState={treeState}></TreeStateLog>
            {tree && <TreeInfo treeDetails={tree}></TreeInfo>}
        </div>
    );
};

export default SubmitGroup;