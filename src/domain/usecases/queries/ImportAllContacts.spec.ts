import { Contact } from "../../entities/Contact";
import {
  IContactQueriesRepository,
  ContactRepositoryError,
} from "../../ports/repository/Contact";
import { ImportAllContacts, ImportAllContactsError } from "./ImportAllContacts";

const mockContactQueriesRepository = jest.mocked<IContactQueriesRepository>({
  findAllContacts: jest.fn(),
});

beforeEach(() => {
  mockContactQueriesRepository.findAllContacts.mockClear();
});

describe("Test UseCase ImportContacts", () => {
  it("Should be call ContactQueriesRepository.findAllContacts once and with correct values", async () => {
    const sut = new ImportAllContacts(mockContactQueriesRepository);
    await sut.execute();

    expect(mockContactQueriesRepository.findAllContacts).toHaveBeenCalledTimes(
      1
    );
    expect(mockContactQueriesRepository.findAllContacts).toHaveBeenCalledWith();
  });

  it("Should be return contacts if ContactQueriesRepository.findAllContacts return contacts", async () => {
    const sut = new ImportAllContacts(mockContactQueriesRepository);

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

    mockContactQueriesRepository.findAllContacts.mockResolvedValue([
      contactOne,
      contactTwo,
    ]);

    const result = await sut.execute();

    expect(result).toEqual([contactOne, contactTwo]);
  });

  it("Should throw ImportAllContactsError if ContactQueriesRepository.findAllContacts throws ContactRepositoryError", async () => {
    const sut = new ImportAllContacts(mockContactQueriesRepository);
    mockContactQueriesRepository.findAllContacts.mockRejectedValue(
      new ContactRepositoryError("")
    );

    await expect(sut.execute()).rejects.toThrow(ImportAllContactsError);
  });

  it("Should throw Error if ContactQueriesRepository.findAllContacts throws Error", async () => {
    const sut = new ImportAllContacts(mockContactQueriesRepository);
    mockContactQueriesRepository.findAllContacts.mockRejectedValue(new Error());

    await expect(sut.execute()).rejects.toThrow(Error);
  });
});
