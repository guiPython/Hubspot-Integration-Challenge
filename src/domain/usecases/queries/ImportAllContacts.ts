import { logger } from "../../../logger";
import {
  createCsvContactsRepository,
  createHubSpotContactsRepository,
} from "../../../infrastructure/repositories/ContactRepository";

import { Contact } from "../../entities/Contact";
import {
  IContactQueriesRepository,
  ContactRepositoryError,
} from "../../ports/repository/Contact";

import { IQuery } from "./Query";

class ImportAllContactsError extends Error {
  cause: Error;
  constructor(message: string, cause: Error) {
    super();
    this.message = message;
    this.cause = cause;
  }
}

class ImportAllContacts implements IQuery<void, Contact[]> {
  private readonly repository: IContactQueriesRepository;

  constructor(repository: IContactQueriesRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Contact[]> {
    try {
      const contacts = await this.repository.findAllContacts();
      return contacts;
    } catch (error) {
      if (error instanceof ContactRepositoryError) {
        throw new ImportAllContactsError("Not possible import contacts", error);
      }
      throw error;
    }
  }
}

const importAllContactsFromCsv = (csvPath: string) => {
  const csvContactsRepository = createCsvContactsRepository(csvPath);
  return new ImportAllContacts(csvContactsRepository);
};

const importAllContactsFromHubSpot = (hubSpotKey: string) => {
  const hubSpotContactsRepository = createHubSpotContactsRepository(hubSpotKey);
  return new ImportAllContacts(hubSpotContactsRepository);
};

export {
  ImportAllContacts,
  ImportAllContactsError,
  importAllContactsFromCsv,
  importAllContactsFromHubSpot,
};
