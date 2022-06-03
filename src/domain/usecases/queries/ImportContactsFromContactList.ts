import { createHubSpotContactListRepository } from "../../../infrastructure/repositories/ContactListRepository";
import { Contact } from "../../entities/Contact";
import {
  IContactListQueriesRepository,
  ContactListRepositoryError,
} from "../../ports/repository/ContactList";

import { IQuery } from "./Query";

class ImportContactsFromContactListError extends Error {
  cause: Error;
  constructor(message: string, cause: Error) {
    super();
    this.message = message;
    this.cause = cause;
  }
}

class ImportContactsFromContactList implements IQuery<number, Contact[]> {
  private readonly repository: IContactListQueriesRepository;

  constructor(repository: IContactListQueriesRepository) {
    this.repository = repository;
  }

  async execute(listId: number): Promise<Contact[]> {
    try {
      const contacts = await this.repository.findContactsInListById(listId);
      return contacts;
    } catch (error) {
      if (error instanceof ContactListRepositoryError)
        throw new ImportContactsFromContactListError(
          "Not possible import contacts of list",
          error
        );
      throw error;
    }
  }
}

const importContactsFromContactListInHubSpot = (hubSpotKey: string) => {
  const hubSpotContactListRepository =
    createHubSpotContactListRepository(hubSpotKey);
  return new ImportContactsFromContactList(hubSpotContactListRepository);
};

export {
  ImportContactsFromContactList,
  ImportContactsFromContactListError,
  importContactsFromContactListInHubSpot,
};
