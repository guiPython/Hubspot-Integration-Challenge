import { Email } from "./Email";

class Contact {
  readonly name: string;
  readonly lastname: string;
  readonly _email: Email;
  readonly timestamp: number;
  readonly gender: string;

  constructor({
    name,
    lastname,
    email,
    gender,
    timestamp,
  }: {
    name: string;
    lastname: string;
    email: string;
    gender?: string;
    timestamp?: number;
  }) {
    this.name = name;
    this.lastname = lastname;
    this._email = Email.create(email);
    this.gender = gender;
    this.timestamp = timestamp ?? Date.now();
  }

  get email() {
    return this._email.value;
  }

  get emailDomain() {
    return this._email.domain;
  }

  equals(other: Contact) {
    return this.email === other.email;
  }
}

export { Contact };
