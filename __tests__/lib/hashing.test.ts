import { eip712Sign, eip712MsgHash } from "../../lib/hashing";
import { ethers } from "ethers";

const expectedTestSignature =
  "0x5cc12de6cb6b5c3c55203759306dceb065539ca7c90422272605074c2a224c7577bef512d1eeceeb24b5c8e7ac3ce7ea42bb2ed843a67b2acd06214f2600c1581b";
const expectedTestHashing =
  "0xe30cc3b6e19b2cdf533a0fae01825148e87113843d66abd72c2cf7ee71ddfccf";

describe("Testing lib:hashing", () => {
  it("correctly performs eip712 signing", async () => {
    const wallet = new ethers.Wallet(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    );
    const signature = await eip712Sign(wallet, "", "heyanon");
    expect(signature).toEqual(expectedTestSignature);
  });

  it("correctly performs hashing", () => {
    const hash = eip712MsgHash({
      platform: "heyanon",
      type: "heyanon",
      contents: "heyanon",
    });
    expect(expectedTestHashing).toEqual(expectedTestHashing);
  });
});
