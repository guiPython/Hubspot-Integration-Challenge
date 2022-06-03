import { Contact } from "../../entities/Contact";
import {
  IContactCommandsRepository,
  ContactRepositoryError,
} from "../../ports/repository/Contact";

import { CreateContacts } from "./CreateContacts";

const mockContactCommandsRepository: jest.Mocked<IContactCommandsRepository> = {
  createContact: jest.fn(),
  createContacts: jest.fn(),
};

describe("Test Command UseCase CreateContact", () => {
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

  it("Should be call ContactCommandRepository.createContacts once and with correct values", async () => {
    const sut = new CreateContacts(mockContactCommandsRepository, [
      contactOne,
      contactTwo,
    ]);
    await sut.execute();
    expect(mockContactCommandsRepository.createContacts).toHaveBeenCalledTimes(
      1
    );

    expect(mockContactCommandsRepository.createContacts).toBeCalledWith([
      contactOne,
      contactTwo,
    ]);
  });

  describe("Should be return {status: true, value: true} if ContactCommandRepository.createContacts return true OR contacts === []", () => {
    mockContactCommandsRepository.createContacts.mockResolvedValue(true);
    it("List with two distinct contacts", async () => {
      const sut = new CreateContacts(mockContactCommandsRepository, [
        contactOne,
        contactTwo,
      ]);
      const result = await sut.execute();
      expect(result).toMatchObject({ status: true, value: true });
    });

    it("List without contacts", async () => {
      const sut = new CreateContacts(mockContactCommandsRepository, []);
      const result = await sut.execute();
      expect(result).toMatchObject({ status: true, value: true });
    });
  });

  it("Should be return {status: false, value: Error} if ContactCommandRepository.createContacts throws ContactRepositoryError", async () => {
    const sut = new CreateContacts(mockContactCommandsRepository, [
      contactOne,
      contactTwo,
    ]);

    mockContactCommandsRepository.createContacts.mockRejectedValue(
      new ContactRepositoryError("")
    );
    const result = await sut.execute();
    expect(result).toMatchObject({
      status: false,
      value: new ContactRepositoryError(""),
    });
  });

  it("Should be throw Error if ContactCommandRepository.createContacts throws Error", async () => {
    const sut = new CreateContacts(mockContactCommandsRepository, [
      contactOne,
      contactTwo,
    ]);

    mockContactCommandsRepository.createContacts.mockRejectedValue(new Error());
    await expect(sut.execute).rejects.toThrow(Error);
  });
});
