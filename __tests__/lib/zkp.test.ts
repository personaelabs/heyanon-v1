import {
  downloadFromFilename,
  downloadProofFiles,
  bigIntToArray,
  pubkeyToXYArrays,
  sigToRSArrays,
  buildInput,
} from "../../lib/zkp";

import proofType from "../../__mocks__/proof.json";
import fs from "fs";

const zkey = fs.readFileSync("__mocks__/dizkus.zkey");
const filename = "dizkus_64";
const consoleSpy = jest.spyOn(console, "log");

//@ts-ignore
import { Response } from "node-fetch";
import localforage from "localforage";

describe("Testing lib:zkp", () => {
  describe("downloadFromFilename", () => {
    it("catches error if Promise does not resolve to a Response", async () => {
      (fetch as jest.Mock).mockReturnValue(
        Promise.resolve("Not an array buffer")
      );
      await downloadFromFilename(filename, proofType);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Storage of ${proofType.filename} unsuccessful, make sure IndexedDB is enabled in your browser.`
      );
      consoleSpy.mockClear();
    });
    it("validates antyhing as long as Promise resolves to a Response", async () => {
      (fetch as jest.Mock).mockReturnValue(
        Promise.resolve(new Response("NotAZkey"))
      );
      await downloadFromFilename(filename, proofType);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Storage of ${filename} successful!`
      );
      consoleSpy.mockClear();
    });
  });
  describe("downloadProofFiles", () => {
    it("does not download when file is already present with localforage", async () => {
      //@ts-ignore
      localforage.getItem = jest.fn(() =>
        Promise.resolve(new Uint8Array([1, 2, 3]))
      ); // mocking getItem to resolve to an already present file
      await downloadProofFiles(proofType);
      // 10: number of downloaded chunks and corresponding console logs
      expect(consoleSpy).toHaveBeenCalledTimes(10);
      consoleSpy.mockClear();
    });
  });
  describe("bigIntToArray", () => {
    it("computes correctly for 2, 2, BigInt(2)", () => {
      expect(bigIntToArray(2, 2, BigInt(2))).toEqual([2n, 0n]);
    });
  });
  describe("pubkeyToXYArrays", () => {
    it("computes correctly xy arrays for dfcfd60cd4d6a918398bf8174cf617097d004ac7c721b529ed9931f3239863a71f66d29e7b4de01b0ac3b0be3a0aa572da8b32cdc3ec9a81be94a5a7a3f62ba1", () => {
      const testX = [
        "11038871495867868959",
        "21048806354528749",
        "10085836984809884029",
        "14976171719141169209",
      ];
      const testY = [
        "13732783303188425633",
        "15747736381367818881",
        "775657891901908338",
        "28942025739853851",
      ];
      const [x, y] = pubkeyToXYArrays(
        "04dfcfd60cd4d6a918398bf8174cf617097d004ac7c721b529ed9931f3239863a71f66d29e7b4de01b0ac3b0be3a0aa572da8b32cdc3ec9a81be94a5a7a3f62ba1"
      );
      expect(x).toEqual(testX);
      expect(y).toEqual(testY);
    });
  });
  describe("sigToRSArrays", () => {
    it("computes correctly R and S from 24407bf886f73c6548355d89b07c27629b77b2fe05d76dbd6f1dbc81b3cf2eb37f0484a9f60a010a6f02172c2253d7cbbadb8f1d708d354bec65579216867eb81b", () => {
      const [rTest, sTest] = [
        [
          "2142730131996586879",
          "8625235537410506095",
          "3845381047934476955",
          "4646580699120035144",
        ],
        [
          "7302465946247936027",
          "15820896385218464748",
          "150637638487362490",
          "325571947272407663",
        ],
      ];
      const [r, s] = sigToRSArrays(
        "24407bf886f73c6548355d89b07c27629b77b2fe05d76dbd6f1dbc81b3cf2eb37f0484a9f60a010a6f02172c2253d7cbbadb8f1d708d354bec65579216867eb81b"
      );
      expect(r).toEqual(r);
      expect(s).toEqual(s);
    });
  });
});
