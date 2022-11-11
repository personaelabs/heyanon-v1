import {
  changeNetworkName,
  userConnectToMetamask,
} from "../../../lib/frontend/web3";
import * as setupWeb3 from "../../../lib/frontend/setup";
import { MerkleTree } from "../../../lib/merkleTree";
import { Stage } from "../../../lib/frontend/proofStages";

const spySetupWeb3 = jest.spyOn(setupWeb3, "setupWeb3");
const mockSetSigner = jest.fn((value) => null);
const mockSetAddress = jest.fn((value) => null);
const mockSetStage = jest.fn((value) => null);
const addr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

spySetupWeb3.mockReturnValue(
  Promise.resolve({
    provider: {},
    signer: {
      getAddress: async () => {
        return Promise.resolve(addr);
      },
    },
    network: {},
  })
);

describe("Testing lib/frontend:web3", () => {
  describe("changeNetworkName", () => {
    it("returns same network name when chainId is not 1", () => {
      const network = { chainId: 3, name: "ropsten" };
      expect(changeNetworkName(network).name).toEqual("ropsten");
    });

    it("changes network name to mainnet, when network chainId is 1", () => {
      const network = { chainId: 1, name: "ropsten" };
      expect(changeNetworkName(network).name).toEqual("mainnet");
    });
  });

  describe("useConnectToMetamask", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("setStage to Stage.NEWADDRESS when not in merkle tree", async () => {
      const mockMerkleTree: Partial<MerkleTree> = {
        leafToPathElements: {},
      };
      await userConnectToMetamask(
        mockMerkleTree as MerkleTree,
        mockSetSigner,
        mockSetAddress,
        mockSetStage
      );
      expect(mockSetStage.mock.calls[0][0]).toBe(Stage.NEWADDRESS);
    });
    it("setStage to Stage.MSGTYPE when in merkle tree", async () => {
      const addrBigInt = BigInt(addr).toString(); // in BigInt within tree
      const mockMerkleTree: Partial<MerkleTree> = {
        leafToPathElements: {}
      };
      mockMerkleTree.leafToPathElements![`${addrBigInt}`] = ["h0", "h1"];
      await userConnectToMetamask(
        mockMerkleTree as MerkleTree,
        mockSetSigner,
        mockSetAddress,
        mockSetStage
      );
      expect(mockSetStage.mock.calls[0][0]).toBe(Stage.MSGTYPE);
    });
  });
});
