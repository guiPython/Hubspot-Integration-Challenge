import { ContactList } from "../../entities/ContactList";
import { Contact } from "../../entities/Contact";
import {
  IAddContactInContactListInput,
  IContactListCommandsRepository,
  ContactListRepositoryError,
} from "../../ports/repository/ContactList";

import { ErrorOnRunCommand, ICommand, ICommandResponse } from "./ICommand";

class AddContactsInContactList implements ICommand<Contact[]> {
  private readonly list: ContactList;
  private readonly repository: IContactListCommandsRepository;
  private readonly contacts: Contact[];

  constructor(
    repository: IContactListCommandsRepository,
    list: ContactList,
    contacts: Contact[]
  ) {
    this.repository = repository;
    this.list = list;
    this.contacts = contacts;
  }

  async execute(): Promise<ICommandResponse<Contact[]> | ErrorOnRunCommand> {
    try {
      const input: IAddContactInContactListInput = {
        listId: this.list.id,
        contacts: this.contacts,
      };
      const result = await this.repository.addContactsInContactList(input);
      return { status: true, value: result };
    } catch (error) {
      if (error instanceof ContactListRepositoryError)
        return { status: false, value: error };
      throw error;
    }
  }
}

export { AddContactsInContactList };
