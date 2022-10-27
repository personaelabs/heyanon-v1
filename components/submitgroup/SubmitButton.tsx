import { FunctionComponent } from "react";

export const SubmitButton: FunctionComponent<SubmitButtonInterface> = ({ text, disabled, onClick }) => {
    const buttonStyle = disabled ? "opacity-50" : "hover:opacity-50";
    return (
        <div className={`flex w-8/12 justify-end`}>
            <button disabled={false} onClick={onClick} className={`p-3 rounded-lg ${buttonStyle} border-black border-2`}>{text}</button>
        </div>
    );
};
