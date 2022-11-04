import { generateSignalHash } from "../../lib/semaphore";
import { ethers } from "ethers";

describe("Testing lib:semaphore", () => {
  describe("generateSignalHash", () => {
    it("keccak224 != 256", () => {
      const keccak256 = BigInt(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("helloworld"))
      );
      const keccak224 = generateSignalHash("helloworld");
      expect(keccak224 != keccak256).toBeTruthy();
    });
    it("returns a BigInt", () => {
      const keccak224 = generateSignalHash("helloworld");
      expect(typeof keccak224).toBe("bigint");
    });
  });
});
