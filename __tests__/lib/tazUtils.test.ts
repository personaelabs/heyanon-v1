import { getGroupIdentities } from "../../lib/tazUtils";
import axios from "axios";

const randomIdentityCommitments = (nIdentityCommitments: number) => {
  const randomArray = [];
  for (let i = 0; i < nIdentityCommitments; i++) {
    randomArray.push({
      identityCommitment: String(Math.random()),
      index: i,
    });
  }
  return randomArray;
};

describe("Testing lib:tazUtils", () => {
  describe("getGroupIdentities", () => {
    it("returns identity commitments correctly", async () => {
      axios.post = jest.fn().mockResolvedValue({
        data: { data: { members: randomIdentityCommitments(15) } },
      });
      const identityCommitments = await getGroupIdentities();
      expect(identityCommitments.length).toEqual(15);
    });

    it("returns an array of strings", async () => {
      axios.post = jest.fn().mockResolvedValue({
        data: { data: { members: randomIdentityCommitments(15) } },
      });
      const identityCommitment = await getGroupIdentities();
      expect(Array.isArray(identityCommitment)).toBeTruthy();
    });
  });
});
