import { Email } from "./Email";

describe("Test Email Value Object", () => {
  describe("Test create function", () => {
    describe("Should throws Error with message: `Invalid email, must be contains '@' and can`t and with '@'` ", () => {
      it("Email ends with '@'", () => {
        expect(() => Email.create("test@")).toThrow(
          "Invalid email, must be contains '@' and can`t and with '@'"
        );
      });

      it("Email starts with '@'", () => {
        expect(() => Email.create("@test")).toThrow(
          "Invalid email, must be contains '@' and can`t and with '@'"
        );
      });

      it("Email without '@'", () => {
        expect(() => Email.create("test.test.com")).toThrow(
          "Invalid email, must be contains '@' and can`t and with '@'"
        );
      });
    });

    describe("Shoud be return a Email object", () => {
      test("Valid Email", () => {
        const validEmail = "test@test.com";
        const result = Email.create(validEmail);
        expect(result).toBeInstanceOf(Email);
        expect(result).toHaveProperty("value", validEmail);
      });
    });
  });

  describe("Test getter for domain property", () => {
    it("Should be return test.com", () => {
      const validEmail = "test@test.com";
      const result = Email.create(validEmail);
      expect(result.domain).toStrictEqual("test.com");
    });
  });
});
