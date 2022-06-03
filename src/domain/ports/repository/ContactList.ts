import { Contact } from "@domain/entities/Contact";
import { ContactList } from "@domain/entities/ContactList";

export class ContactListRepositoryError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
}

export interface IContactListQueriesRepository {
  findContactsInListById(id: number): Promise<Contact[]>;
}

export interface ICreateContactListInput {
  name: string;
}

export interface IAddContactInContactListInput {
  listId: number;
  contacts: Contact[];
}

export interface IContactListCommandsRepository {
  createContactList(input: ICreateContactListInput): Promise<ContactList>;
  addContactsInContactList(
    input: IAddContactInContactListInput
  ): Promise<Contact[]>;
}

export interface IContactListRepository
  extends IContactListQueriesRepository,
    IContactListCommandsRepository {}
