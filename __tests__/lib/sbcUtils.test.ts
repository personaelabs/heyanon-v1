import { reputationToRoleText } from "../../lib/sbcUtils";

describe("Testing lib:sbcUtils", () => {
  describe("reputationToRoleText", () => {
    it("returns valid reputation role upon provided int", () => {
      const magician = reputationToRoleText(50);
      const wizard = reputationToRoleText(150);
      const alchemist = reputationToRoleText(250);
      const sorcerer = reputationToRoleText(350);
      expect(magician).toEqual("A Magician");
      expect(wizard).toEqual("A Wizard");
      expect(alchemist).toEqual("An Alchemist");
      expect(sorcerer).toEqual("A Sorcerer");
    });
  });
});
