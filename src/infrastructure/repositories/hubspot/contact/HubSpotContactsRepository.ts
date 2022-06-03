import { Contact } from "../../../../domain/entities/Contact";
import {
  IContactRepository,
  ContactRepositoryError,
} from "../../../../domain/ports/repository/Contact";
import { HubSpotClientError } from "../client/shared/error";

import { IHubSpotContactsClient } from "../client/contact/HubSpotContactsClient";
import {
  GetAllContacts,
  HubSpotContactBatch,
  RegisterContact,
  RegisterContacts,
} from "../client/contact/requests/HubSpotContactsRequest";
import { SuccessOnGetAllContacts } from "../client/contact/responses/HubSpotContactsResponses";
import { logger } from "../../../../logger";

const maxContactsPerRequest = "100";

class HubSpotContactsRepository implements IContactRepository {
  private readonly apiKey: string;
  private readonly hubspotClient: IHubSpotContactsClient;
  constructor(apiKey: string, hubspotClient: IHubSpotContactsClient) {
    this.hubspotClient = hubspotClient;
    this.apiKey = apiKey;
  }

  async findAllContacts(): Promise<Contact[]> {
    let isFirstRequest = true;
    let hasMore = false;
    let vidOffset = "";
    try {
      let request: GetAllContacts = {
        hapiKey: this.apiKey,
        pathParameter: { count: maxContactsPerRequest },
      };

      const contacts: Contact[] = [];
      let response: SuccessOnGetAllContacts;

      while (hasMore || isFirstRequest) {
        if (isFirstRequest) {
          response = await this.hubspotClient.getAllContacts(request);
          vidOffset = response.body["vid-offset"].toString();
          isFirstRequest = false;
        } else {
          const pathParameter = {
            count: maxContactsPerRequest,
            vidOffset: vidOffset,
          };
          request.pathParameter = pathParameter;
          response = await this.hubspotClient.getAllContacts(request);
        }
        hasMore = response.body["has-more"];
        response.body.contacts.forEach((c) =>
          contacts.push(
            new Contact({
              name: c.properties.firstname.value,
              lastname: c.properties.lastname.value,
              email: c["identity-profiles"][0].identities[0].value,
            })
          )
        );
      }

      return contacts;
    } catch (err) {
      if (err instanceof HubSpotClientError)
        throw new ContactRepositoryError(err.message);
      throw err;
    }
  }

  async createContact(contact: Contact): Promise<boolean> {
    try {
      const request: RegisterContact = {
        hapiKey: this.apiKey,
        pathParameters: { email: contact.email },
        body: {
          properties: [
            { property: "firstname", value: contact.name },
            { property: "lastname", value: contact.lastname },
          ],
        },
      };

      const response = await this.hubspotClient.registerContact(request);
      if (response.status === "400")
        throw new ContactRepositoryError("Malformed contact");
      if (response.status === "409")
        throw new ContactRepositoryError("Contact already exists");
      return true;
    } catch (err) {
      if (err instanceof HubSpotClientError)
        throw new ContactRepositoryError(err.message);
      throw err;
    }
  }

  async createContacts(contacts: Contact[]): Promise<boolean> {
    try {
      const registers: HubSpotContactBatch[] = contacts.map((c) => {
        return {
          email: c.email,
          properties: [
            { property: "firstname", value: c.name },
            { property: "lastname", value: c.lastname },
          ],
        };
      });

      const request: RegisterContacts = {
        hapiKey: this.apiKey,
        body: registers,
      };
      const response = await this.hubspotClient.registerContacts(request);

      if (response.status === "400")
        throw new ContactRepositoryError(
          "Cannot create some contact in list, aborted operation"
        );
      return true;
    } catch (err) {
      if (err instanceof HubSpotClientError)
        throw new ContactRepositoryError(err.message);
      throw err;
    }
  }
}

export { HubSpotContactsRepository };
