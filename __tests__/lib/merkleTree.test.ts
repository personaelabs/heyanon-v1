import axios from "axios";
import { treeFromCloudfront } from "../../lib/merkleTree";

jest.mock("axios");

describe("Testing lib:merkleTree", () => {
  it("returns undefined if download throws", async () => {
    //@dev provide types here
    axios.get = jest.fn().mockResolvedValue(new Error());
    const resp = await treeFromCloudfront("some-invalid-url");
    expect(resp).toBe(undefined);
  });
});
