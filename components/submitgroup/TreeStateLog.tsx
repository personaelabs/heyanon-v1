import { FunctionComponent } from "react";

export enum TreeState {
    TREE_NOT_SUBMITTED = "",
    TREE_PRECHECKS = "20% - Checking that tree does not already exists...",
    TREE_BUILDING = "40% - Tree is being built...",
    TREE_CREATING_ENTRY = "60% - A new group entry is being created...",
    TREE_UPLOADING_USERS = "80% - Uploading tree users and leaves...",
    TREE_UPLOADED = "100% - Tree uploaded!"
}

export enum TreeError {
    GROUP_EXISTS = "Error: group already exists",
    TWITTER_EXISTS = "Error: twitter already exists",
    INVALID_ADDRESS = "Error: invalid keccak address found in csv",
    SERVER_ERROR = "Server error: contact @personaelabs"
}

export const TreeStateLog: FunctionComponent<{ treeState: string; }> = ({ treeState }) => {
    return (
        <div className='flex justify-center my-10'>{treeState}</div>
    );
};
