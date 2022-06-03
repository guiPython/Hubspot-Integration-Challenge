import { ContactList } from "../../entities/ContactList";
import {
  IContactListCommandsRepository,
  ICreateContactListInput,
  ContactListRepositoryError,
  IAddContactInContactListInput,
} from "../../ports/repository/ContactList";

import { CreateContactList } from "./CreateContactList";

const mockContactListCommandsRepository: jest.Mocked<IContactListCommandsRepository> =
  {
    createContactList: jest.fn(),
    addContactsInContactList: jest.fn(),
  };

beforeEach(() => {
  mockContactListCommandsRepository.createContactList.mockClear();
});

describe("Test Command UseCase CreateContactList", () => {
  const validInputAddContactInContactList: ICreateContactListInput = {
    name: "Lista Teste",
  };

  const validContactList = new ContactList(
    1,
    [],
    validInputAddContactInContactList.name
  );

  it("Should be call ContactListCommandRepository.createContactList once and with correct values", async () => {
    const sut = new CreateContactList(
      mockContactListCommandsRepository,
      validInputAddContactInContactList.name,
      []
    );

    mockContactListCommandsRepository.createContactList.mockResolvedValue(
      validContactList
    );

    await sut.execute();

    expect(
      mockContactListCommandsRepository.createContactList
    ).toHaveBeenCalledTimes(1);

    expect(
      mockContactListCommandsRepository.addContactsInContactList
    ).toHaveBeenCalledTimes(1);

    const parameterForCreateList: ICreateContactListInput = {
      name: validInputAddContactInContactList.name,
    };
    expect(mockContactListCommandsRepository.createContactList).toBeCalledWith(
      parameterForCreateList
    );

    const parameterForAddContacts: IAddContactInContactListInput = {
      listId: validContactList.id,
      contacts: validContactList.contacts,
    };

    expect(
      mockContactListCommandsRepository.addContactsInContactList
    ).toBeCalledWith(parameterForAddContacts);
  });

  it("Should be return {status: true, value: contactList}", async () => {
    const sut = new CreateContactList(
      mockContactListCommandsRepository,
      validInputAddContactInContactList.name,
      []
    );

    mockContactListCommandsRepository.createContactList.mockResolvedValue(
      validContactList
    );
    const result = await sut.execute();
    expect(result).toMatchObject({
      status: true,
      value: validContactList,
    });
  });

  it("Should be return {status: false, value: Error} if ContactListCommandRepository.createContactList throws ContactListRepositoryError", async () => {
    const sut = new CreateContactList(
      mockContactListCommandsRepository,
      validContactList.name,
      validContactList.contacts
    );

    mockContactListCommandsRepository.createContactList.mockRejectedValue(
      new ContactListRepositoryError("")
    );
    const result = await sut.execute();
    expect(result).toMatchObject({ status: false, value: new Error() });
  });

  it("Should be throw Error if ContactListCommandRepository.createContactList throws Error", async () => {
    const sut = new CreateContactList(
      mockContactListCommandsRepository,
      validContactList.name,
      validContactList.contacts
    );

    mockContactListCommandsRepository.createContactList.mockRejectedValue(
      new Error()
    );
    await expect(sut.execute).rejects.toThrow(Error);
  });
});
