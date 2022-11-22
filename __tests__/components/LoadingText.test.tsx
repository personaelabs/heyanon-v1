import { render, screen } from "@testing-library/react";
import React, { useEffect } from "react";
import LoadingText from "../../components/LoadingText";

jest.spyOn(React, 'useEffect').mockImplementation((f) => null);

describe('Testing components/LoadingText', () => {
    it("should have 4 span tags on proof == true", () => {
        const { container } = render(<LoadingText currentStage={""} isProof={true} />);
        const divTags = container.getElementsByTagName("span");
    });
    it("should have 2 span tags on proof == false", () => {
        const { container } = render(<LoadingText currentStage={""} isProof={false} />);
        const divTags = container.getElementsByTagName("span");
    });
});