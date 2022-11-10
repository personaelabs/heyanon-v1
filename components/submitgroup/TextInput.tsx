import { FunctionComponent } from "react";

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
