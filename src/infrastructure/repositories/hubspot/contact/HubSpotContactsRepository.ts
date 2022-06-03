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
import {
  ErrorOnCreateContacts,
  SuccessOnCreateContacts,
  SuccessOnGetAllContacts,
} from "../client/contact/responses/HubSpotContactsResponses";
import { BatchUtil } from "../../../../utils/Batchs";

const maxContactsPerRequest = "100";

class HubSpotContactsRepository implements IContactRepository {
  private readonly apiKey: string;
  private readonly hubspotClient: IHubSpotContactsClient;
  private readonly batchUtil: BatchUtil<Contact> = new BatchUtil();

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
        vidOffset = response.body["vid-offset"].toString();
        response.body.contacts.forEach((c) =>
          contacts.push(
            new Contact({
              name: c.properties.firstname.value,
              lastname: c.properties.lastname.value,
              email: c["identity-profiles"][0].identities[0].value,
            })
          )
        );

        if (
          request.pathParameter.vidOffset ===
          response.body["vid-offset"].toString()
        )
          hasMore = false;
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
    if (contacts.length === 0) return true;
    const chunks = this.batchUtil.sliceIntoChunks(
      contacts,
      Number(maxContactsPerRequest)
    );

    const requests: RegisterContacts[] = chunks.map((chunk) => {
      const contacts: HubSpotContactBatch[] = chunk.map((c) => {
        return {
          email: c.email,
          properties: [
            { property: "firstname", value: c.name },
            { property: "lastname", value: c.lastname },
          ],
        };
      });

      return {
        hapiKey: this.apiKey,
        body: contacts,
      };
    });

    const promises: Promise<SuccessOnCreateContacts | ErrorOnCreateContacts>[] =
      [];

    for (let request of requests) {
      promises.push(this.hubspotClient.registerContacts(request));
    }

    return await Promise.all(promises)
      .then((responses) => {
        const statusOfResponses = responses.map((r) => r.status);
        if (statusOfResponses.includes("400"))
          throw new ContactRepositoryError(
            "Cannot create some contact in list, aborted operation"
          );
        return true;
      })
      .catch((err) => {
        if (err instanceof HubSpotClientError)
          throw new ContactRepositoryError(err.message);
        throw err;
      });
  }
}

export { HubSpotContactsRepository };
