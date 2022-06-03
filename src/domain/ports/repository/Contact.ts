import { Contact } from "../../entities/Contact";

export class ContactRepositoryError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
}

export interface IContactQueriesRepository {
  findAllContacts(): Promise<Contact[]>;
}

export interface IContactCommandsRepository {
  createContact(contact: Contact): Promise<boolean>;
  createContacts(contact: Contact[]): Promise<boolean>;
}

export interface IContactRepository
  extends IContactQueriesRepository,
    IContactCommandsRepository {}
