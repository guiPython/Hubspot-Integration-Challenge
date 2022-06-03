import { Contact } from "./Contact";
import { Email } from "./Email";

describe("Test Contact Entity", () => {
  describe("Test create Contact", () => {
    const validInputContact = {
      name: "Test",
      lastname: "Test",
      email: "test@test.com",
    };

    const inputContactWithInvalidEmail = {
      name: "Test",
      lastname: "Test",
      email: "Test",
    };

    it("Should be return a new Contact", () => {
      const contact = new Contact(validInputContact);
      expect(contact).toBeInstanceOf(Contact);
      expect(contact).toHaveProperty("name", validInputContact.name);
      expect(contact).toHaveProperty("lastname", validInputContact.lastname);
      expect(contact).toHaveProperty(
        "email",
        Email.create(validInputContact.email).value
      );
    });

    it("Should throws Error with message: `Invalid email, must be contains '@' and can`t and with '@'`", () => {
      expect(() => new Contact(inputContactWithInvalidEmail)).toThrow(
        "Invalid email, must be contains '@' and can`t and with '@'"
      );
    });
  });
});
