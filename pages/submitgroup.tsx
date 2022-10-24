import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Dispatch, FunctionComponent, SetStateAction, useRef, useState } from "react";
import { Title } from "../components/Base";
import Papa from "papaparse";
import ethers from "ethers";
export const PageDescription: FunctionComponent = () => {
    return (
        <div className="flex h-full justify-center bg-heyanonred text-white">
            <div className="items-center justify-center self-center prose max-w-prose">
                <div className="flex justify-center pt-10">
                    <Image src="/logo.svg" alt="heyanon!" width="174" height="120" />
                </div>

                <div className="px-8">
                    <div className="flex text-center justify-center pb-5">
                        <Title>
                            Create a group with{" "}
                            <a
                                href="https://twitter.com/heyanonxyz"
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                @heyanonxyz
                            </a>
                            !
                        </Title>
                    </div>
                </div>
            </div>
        </div>
    );
};
export const Header: FunctionComponent = () => {
    return (
        <Head>
            <title>heyanon!</title>
            <link rel="icon" href="/heyanon.ico" />
        </Head>

    );
};

interface TextInputInterface {
    descriptionTextInput: string;
    stateSetter: Dispatch<SetStateAction<null | string>>;
    initialState: null | string;
}


export const TextInput: FunctionComponent<TextInputInterface> = ({ descriptionTextInput, stateSetter, initialState }) => {
    return (
        <div className="mb-10">
            <div className="mb-2">
                {descriptionTextInput}
            </div>
            <div>
                <input className='border-b-2 bg-heyanonred w-10/12 outline-none border-black' onChange={(e) => stateSetter(e.target.value)} type="text" />
            </div>
        </div>
    );
};

enum TreeState {
    TREE_NOT_SUBMITTED = "",
    TREE_PRECHECKS = "20% - Checking that tree does not already exists...",
    TREE_BUILDING = "40% - Tree is being built...",
    TREE_CREATING_ENTRY = "60% - A new group entry is being created...",
    TREE_UPLOADING_USERS = "80% - Uploading tree users and leaves...",
    TREE_UPLOADED = "100% - Tree uploaded!"
}

enum TreeError {
    GROUP_EXISTS = "Error: group already exists",
    TWITTER_EXISTS = "Error: twitter already exists",
    INVALID_ADDRESS = "Error: invalid keccak address found in csv",
    SERVER_ERROR = "Server error: contact @personaelabs"
}

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


    return (
        <div className="scroll-smooth">
            <Header></Header>
            <PageDescription></PageDescription>
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
        </div>
    );
};

export default SubmitGroup;