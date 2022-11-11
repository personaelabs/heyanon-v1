import { setupWeb3 } from "../../../lib/frontend/setup";

describe("setupWeb3", () => {
    it("throws when window.ethereum is undefined", async () => {
      window.ethereum = jest.fn().mockReturnValue(undefined);
      try {
        // could not detect network (event="noNetwork", code=NETWORK_ERROR, version=providers/5.6.8)
        await setupWeb3();
      } catch (error) {
        expect((error as any).message).toContain("could not detect network");
      }
    });
  });