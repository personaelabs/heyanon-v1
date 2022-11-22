import PostMsgPage, { Stage } from "../../pages/taz";
import { render } from "@testing-library/react";
import React from "react";

/**
 * we mock a few implementations related
 * to circomlib
 */
jest.mock("../../lib/zkp.snarkjs", () => ({
  generateProof: jest.fn(),
}));

jest.mock("circomlibjs", () => ({
  poseidon: jest.fn(),
}));

// TODO: provide better mocked implementation here
jest.spyOn(React, "useEffect").mockImplementation((f) => null);

describe("Testing taz page", () => {
  it("displays loading title on loading", () => {
    const { container } = render(<PostMsgPage />);
    const title = container.getElementsByTagName("h1");
    expect(title[0].textContent).toEqual(Stage.CONNECTING);
  });
});
