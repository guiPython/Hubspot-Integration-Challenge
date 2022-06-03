import {
  IContactRepository,
  IContactQueriesRepository,
} from "@domain/ports/repository/Contact";
import { CsvReader } from "./csv/CsvReader";
import {
  ContactChunk,
  CsvContactRepository,
} from "./csv/CsvContactsRepository";
import { HubSpotContactsClient } from "./hubspot/client/contact/HubSpotContactsClient";
import { HubSpotContactsRepository } from "./hubspot/contact/HubSpotContactsRepository";
import { Contact } from "@domain/entities/Contact";

const createHubSpotContactsRepository = (
  hubSpotApiKey: string
): IContactRepository => {
  const client = new HubSpotContactsClient();
  return new HubSpotContactsRepository(hubSpotApiKey, client);
};

const createCsvContactsRepository = (
  csvPath: string
): IContactQueriesRepository => {
  const reader = new CsvReader<ContactChunk, Contact>({ ignoreHeader: true });
  return new CsvContactRepository(csvPath, reader);
};

export { createHubSpotContactsRepository, createCsvContactsRepository };
