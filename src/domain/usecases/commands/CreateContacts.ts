import { createHubSpotContactsRepository } from "../../../infrastructure/repositories/ContactRepository";
import { logger } from "../../../logger";
import { Contact } from "../../entities/Contact";
import {
  IContactCommandsRepository,
  ContactRepositoryError,
} from "../../ports/repository/Contact";

import { ErrorOnRunCommand, ICommand, ICommandResponse } from "./ICommand";

class CreateContacts implements ICommand<boolean> {
  private readonly contacts: Contact[];
  private readonly repository: IContactCommandsRepository;

  constructor(repository: IContactCommandsRepository, contacts: Contact[]) {
    this.repository = repository;
    this.contacts = contacts;
  }

  async execute(): Promise<ICommandResponse<boolean> | ErrorOnRunCommand> {
    if (this.contacts.length === 0) return { status: true, value: true };
    else {
      try {
        const result = await this.repository.createContacts(this.contacts);
        return { status: true, value: result };
      } catch (error) {
        if (error instanceof ContactRepositoryError)
          return { status: false, value: error };
        throw error;
      }
    }
  }
}

const createContactsInHubSpotOnStartup = (
  hubSpotApiKey: string,
  allContacts: Contact[],
  contactsOnHubSpot: Contact[]
) => {
  const emailsInHubSpot = contactsOnHubSpot.map((c) => c.email);

  const validContacts = allContacts.filter(
    (contact) => !emailsInHubSpot.includes(contact.email)
  );

  if (validContacts.length === allContacts.length)
    logger.info("All contacts imported are valids for export");
  else
    logger.warn(`Only ${validContacts.length} contact(s) valid(s) for export`);
  const hubSpotContactsRepository =
    createHubSpotContactsRepository(hubSpotApiKey);
  return new CreateContacts(hubSpotContactsRepository, validContacts);
};

export { CreateContacts, createContactsInHubSpotOnStartup };
