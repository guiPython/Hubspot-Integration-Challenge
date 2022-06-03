import { ContactList } from "../../entities/ContactList";
import { Contact } from "../../entities/Contact";
import {
  IContactListCommandsRepository,
  ICreateContactListInput,
  ContactListRepositoryError,
} from "../../ports/repository/ContactList";

import { ErrorOnRunCommand, ICommand, ICommandResponse } from "./ICommand";
import { createHubSpotContactListRepository } from "../../../infrastructure/repositories/ContactListRepository";

class CreateContactList implements ICommand<ContactList> {
  private readonly listName: string;
  private readonly contacts: Contact[];
  private readonly repository: IContactListCommandsRepository;

  constructor(
    repository: IContactListCommandsRepository,
    listName: string,
    contacts?: Contact[]
  ) {
    this.repository = repository;
    this.listName = listName;
    this.contacts = contacts ?? [];
  }

  async execute(): Promise<ICommandResponse<ContactList> | ErrorOnRunCommand> {
    const input: ICreateContactListInput = {
      name: this.listName,
    };
    try {
      const { id } = await this.repository.createContactList(input);
      const addedContacts = await this.repository.addContactsInContactList({
        listId: id,
        contacts: this.contacts,
      });

      const contactList = new ContactList(id, addedContacts, this.listName);
      return { status: true, value: contactList };
    } catch (error) {
      if (error instanceof ContactListRepositoryError) {
        return { status: false, value: error };
      }
      throw error;
    }
  }
}

const createContactListInHubSpot = (
  hubSpotKey: string,
  listName: string,
  contacts: Contact[]
) => {
  const hubSpotContacListRepository =
    createHubSpotContactListRepository(hubSpotKey);
  return new CreateContactList(hubSpotContacListRepository, listName, contacts);
};

export { CreateContactList, createContactListInHubSpot };
