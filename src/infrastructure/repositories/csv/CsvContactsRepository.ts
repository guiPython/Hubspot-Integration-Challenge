import { Contact } from "../../../domain/entities/Contact";
import {
  ContactRepositoryError,
  IContactQueriesRepository,
} from "../../../domain/ports/repository/Contact";
import { logger } from "../../../logger";

import { CsvReader, ErrorOnReadCsv } from "./CsvReader";

type ContactChunk = {
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
};

class CsvContactRepository implements IContactQueriesRepository {
  reader: CsvReader<ContactChunk, Contact>;
  path: string;

  constructor(path: string, reader: CsvReader<ContactChunk, Contact>) {
    this.path = path;
    this.reader = reader;
  }

  protected transform(chunk: ContactChunk): Contact {
    try {
      const { first_name, last_name, email, gender } = chunk;
      const contact = new Contact({
        name: first_name,
        lastname: last_name,
        email,
        gender,
      });
      return contact;
    } catch (ex) {
      throw new ErrorOnReadCsv(`Cannot parse register of csv to Contact class`);
    }
  }

  async findAllContacts(): Promise<Contact[]> {
    try {
      return await this.reader.read(this.path, this.transform);
    } catch (error) {
      if (error instanceof ErrorOnReadCsv)
        throw new ContactRepositoryError(error.message);
      throw error;
    }
  }
}

export { CsvContactRepository, ContactChunk };
