interface SubmitButtonInterface {
    text: string;
    disabled: boolean;
    onClick: (e: any) => Promise<void>;
}

interface TreeDetails {
    groupId: string;
    groupName: string;
    twitterAccount: string;
    description: string;
    whyUseful: string;
    howGenerated: string;
    secretIndex: number;
  }

  
interface TextInputInterface {
    descriptionTextInput: string;
    stateSetter: Dispatch<SetStateAction<null | string>>;
    initialState: null | string;
}

interface TreeDetails {
    groupId: string;
    groupName: string;
    twitterAccount: string;
    description: string;
    whyUseful: string;
    howGenerated: string;
    secretIndex: number;
}

interface GroupEntry {
    groupId: null | string,
    groupName: null | string,
    groupTwitterAcc: null | string,
    groupDescription: null | string,
    groupUsefulness: null | string,
    generationMethod: null | string,
}