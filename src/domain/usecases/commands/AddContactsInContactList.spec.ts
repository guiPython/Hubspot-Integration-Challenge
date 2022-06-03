import { Contact } from "../../entities/Contact";
import { ContactList } from "../../entities/ContactList";
import {
  IContactListCommandsRepository,
  IAddContactInContactListInput,
  ContactListRepositoryError,
} from "../../ports/repository/ContactList";

import { AddContactsInContactList } from "./AddContactsInContactList";

const mockContactListCommandsRepository: jest.Mocked<IContactListCommandsRepository> =
  {
    createContactList: jest.fn(),
    addContactsInContactList: jest.fn(),
  };

beforeEach(() => {
  mockContactListCommandsRepository.addContactsInContactList.mockClear();
});

describe("Test Command UseCase AddContactsInContactList", () => {
  const contactOne = new Contact({
    name: "Test",
    lastname: "Test",
    email: "test@test.com",
  });

  const contactTwo = new Contact({
    name: "Test2",
    lastname: "Test2",
    email: "test2@test2.com",
  });

  const contactList = new ContactList(1, [], "Lista Teste");

  it("Should be call ContactListCommandRepository.createContactList once and with correct values", async () => {
    const sut = new AddContactsInContactList(
      mockContactListCommandsRepository,
      contactList,
      [contactOne, contactTwo]
    );
    await sut.execute();
    expect(
      mockContactListCommandsRepository.addContactsInContactList
    ).toHaveBeenCalledTimes(1);

    const parameter: IAddContactInContactListInput = {
      listId: contactList.id,
      contacts: [contactOne, contactTwo],
    };
    expect(
      mockContactListCommandsRepository.addContactsInContactList
    ).toBeCalledWith(parameter);
  });

  it("Should be return {status: true, value: Contacts[]}", async () => {
    const sut = new AddContactsInContactList(
      mockContactListCommandsRepository,
      contactList,
      [contactOne, contactTwo]
    );

    mockContactListCommandsRepository.addContactsInContactList.mockResolvedValue(
      [contactOne, contactTwo]
    );
    const result = await sut.execute();
    expect(result).toMatchObject({
      status: true,
      value: [contactOne, contactTwo],
    });
  });

  it("Should be return {status: false, value: Error} if ContactListCommandRepository.createContactList throws ContactListRepositoryError", async () => {
    const sut = new AddContactsInContactList(
      mockContactListCommandsRepository,
      contactList,
      []
    );

    mockContactListCommandsRepository.addContactsInContactList.mockRejectedValue(
      new ContactListRepositoryError("")
    );
    const result = await sut.execute();
    expect(result).toMatchObject({ status: false, value: new Error() });
  });

  it("Should be throw Error if ContactListCommandRepository.createContactList throws Error", async () => {
    const sut = new AddContactsInContactList(
      mockContactListCommandsRepository,
      contactList,
      []
    );

    mockContactListCommandsRepository.addContactsInContactList.mockRejectedValue(
      new ContactListRepositoryError("")
    );
    const result = await sut.execute();
    expect(result).toMatchObject({ status: false, value: new Error() });
  });
});
