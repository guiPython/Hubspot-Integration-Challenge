import { ContactList } from "./ContactList";
import { Contact } from "./Contact";

describe("Test Contact Entity", () => {
  describe("Test create Contact", () => {
    const contact = new Contact({
      name: "Test",
      lastname: "Test",
      email: "test@test.com",
    });

    const validInputContactListWithName = {
      id: 1,
      contacts: [contact],
      name: "Test name for list",
    };

    const validInputContactListWithoutName = {
      id: 1,
      contacts: [contact],
    };

    const invalidInputContactList = {
      id: 1,
      contacts: [],
    };

    describe("Should be return a new ContactList", () => {
      it("Should be return ContactList with name equals 'Test name for list'", () => {
        const contactList = new ContactList(
          validInputContactListWithName.id,
          validInputContactListWithName.contacts,
          validInputContactListWithName.name
        );
        expect(contactList).toBeInstanceOf(ContactList);
        expect(contactList).toHaveProperty(
          "name",
          validInputContactListWithName.name
        );
      });

      it("Should be return ContactList with name equals 'test.test.{timestamp}'", () => {
        const contactList = new ContactList(
          validInputContactListWithoutName.id,
          validInputContactListWithoutName.contacts
        );

        const firstContact = contactList.contacts[0];
        const expectedStringParts = `${firstContact.name.toLowerCase()}.${firstContact.lastname.toLowerCase()}.`;
        expect(contactList).toBeInstanceOf(ContactList);
        expect(contactList.name).toMatch(new RegExp(expectedStringParts, "g"));

        const timestamp = contactList.name.split(".")[2];
        expect(Number.isNaN(timestamp)).toBeFalsy();
        expect(timestamp == " " || timestamp == "").toBeFalsy();
      });
    });

    it("Should throws Error with message: 'Cannot generate list name because there is no contact'", () => {
      expect(
        () =>
          new ContactList(
            invalidInputContactList.id,
            invalidInputContactList.contacts
          )
      ).toThrow("Cannot generate list name because there is no contact");
    });
  });
});
