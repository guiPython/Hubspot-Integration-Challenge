import { Contact } from "../../entities/Contact";
import {
  IContactListQueriesRepository,
  ContactListRepositoryError,
} from "../../ports/repository/ContactList";
import {
  ImportContactsFromContactList,
  ImportContactsFromContactListError,
} from "./ImportContactsFromContactList";

const mockContactListQueriesRepository =
  jest.mocked<IContactListQueriesRepository>({
    findContactsInListById: jest.fn(),
  });

beforeEach(() => {
  mockContactListQueriesRepository.findContactsInListById.mockClear();
});

describe("Test UseCase ImportContactsFromContactList", () => {
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

  it("Should be call ContactListQueriesRepository.findAllContacts once and with correct values", async () => {
    const listId = 1;
    const sut = new ImportContactsFromContactList(
      mockContactListQueriesRepository
    );
    await sut.execute(listId);

    expect(
      mockContactListQueriesRepository.findContactsInListById
    ).toHaveBeenCalledTimes(1);
    expect(
      mockContactListQueriesRepository.findContactsInListById
    ).toHaveBeenCalledWith(listId);
  });

  it("Should be return contacts if ContactListQueriesRepository.findContactsInListById return contacts", async () => {
    const sut = new ImportContactsFromContactList(
      mockContactListQueriesRepository
    );

    mockContactListQueriesRepository.findContactsInListById.mockResolvedValue([
      contactOne,
      contactTwo,
    ]);

    const result = await sut.execute(1);

    expect(result).toEqual([contactOne, contactTwo]);
  });

  it("Should throw ImportContactsFromContacListError if ContactListQueriesRepository.findContactsInListById throws ContactListRepositoryError", async () => {
    const sut = new ImportContactsFromContactList(
      mockContactListQueriesRepository
    );
    mockContactListQueriesRepository.findContactsInListById.mockRejectedValue(
      new ContactListRepositoryError("")
    );

    await expect(sut.execute(1)).rejects.toThrow(
      ImportContactsFromContactListError
    );
  });

  it("Should throw Error if ContactListQueriesRepository.findContactsInListById throws Error", async () => {
    const sut = new ImportContactsFromContactList(
      mockContactListQueriesRepository
    );
    mockContactListQueriesRepository.findContactsInListById.mockRejectedValue(
      new Error()
    );

    await expect(sut.execute(1)).rejects.toThrow(Error);
  });
});
