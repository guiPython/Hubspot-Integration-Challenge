import { Contact } from "./Contact";

class ContactList {
  public readonly id: number;
  public readonly name: string;
  private _contacts: Contact[];

  constructor(id: number, contacts: Contact[], name?: string) {
    this.id = id;
    this._contacts = contacts ?? [];
    this.name = name ?? ContactList.getListNameByContacts(contacts);
  }

  public static getListNameByContacts(contacts: Contact[]): string {
    if (contacts.length === 0)
      throw new Error("Cannot generate list name because there is no contact");
    return `${contacts[0].name.toLowerCase()}.${contacts[0].lastname
      .toLowerCase()
      .replace(" ", "_")}.${new Date().getTime()}`;
  }

  get contacts() {
    return this._contacts;
  }

  addContact(contact: Contact): void {
    this._contacts.push(contact);
  }
}

export { ContactList };
