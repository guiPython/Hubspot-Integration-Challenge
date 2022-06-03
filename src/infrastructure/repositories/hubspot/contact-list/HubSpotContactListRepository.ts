import { Contact } from "../../../../domain/entities/Contact";
import { ContactList } from "../../../../domain/entities/ContactList";
import {
  ContactListRepositoryError,
  IAddContactInContactListInput,
  IContactListRepository,
  ICreateContactListInput,
} from "../../../../domain/ports/repository/ContactList";
import { HubSpotClientError } from "../client/shared/error";

import { IHubSpotContactListClient } from "../client/contact-list/HubSpotContactListClient";
import {
  GetContactListById,
  RegisterContactList,
  RegisterContactsInContactList,
} from "../client/contact-list/requests/HubSpotContactListRequest";

import {
  SuccessOnAddContactsInContactList,
  ErrorOnAddContactsInDynamicContactList,
  ErrorOnAddContactsInNonExistentList,
  ErrorOnGetContactsInContactList,
  SuccessOnGetContactsInContactList,
} from "../client/contact-list/responses/HubSpotContactListResponses";
import { BatchUtil } from "../../../../utils/Batchs";
import { SuccesOnGetAllContactsBody } from "../client/contact/responses/HubSpotContactsResponses";

const maxContactsAdditionsPerRequest = 500;
const maxContactsPerRequest = "100";

class HubSpotContactListRepository implements IContactListRepository {
  private readonly api_key: string;
  private readonly hubSpotClient: IHubSpotContactListClient;
  private readonly batchUtil: BatchUtil<Contact> = new BatchUtil<Contact>();

  constructor(api_key: string, hubSpotClient: IHubSpotContactListClient) {
    this.api_key = api_key;
    this.hubSpotClient = hubSpotClient;
  }

  async findContactsInListById(id: number): Promise<Contact[]> {
    const listId = id.toString();
    let request: GetContactListById = {
      hapiKey: this.api_key,
      pathParameters: { listId: listId, count: maxContactsPerRequest },
    };

    let isFirstRequest = true;
    let hasMore = false;
    let vidOffset = "";

    try {
      const contacts: Contact[] = [];
      let response:
        | SuccessOnGetContactsInContactList
        | ErrorOnGetContactsInContactList;

      while (hasMore || isFirstRequest) {
        if (isFirstRequest) {
          response = await this.hubSpotClient.getContactsInListById(request);
          if (response.status === "200") {
            vidOffset = response.body["vid-offset"].toString();
            isFirstRequest = false;
          } else
            throw new ContactListRepositoryError("Contact list does not exist");
        } else {
          const pathParameter = {
            listId: listId,
            count: maxContactsPerRequest,
            vidOffset: vidOffset,
          };
          request.pathParameters = pathParameter;
          response = await this.hubSpotClient.getContactsInListById(request);
          if (response.status !== "200")
            throw new ContactListRepositoryError("Contact list does not exist");
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
    } catch (error) {
      if (error instanceof HubSpotClientError)
        throw new ContactListRepositoryError(error.message);
      throw error;
    }
  }

  async addContactsInContactList(
    input: IAddContactInContactListInput
  ): Promise<Contact[]> {
    let request: RegisterContactsInContactList = {
      hapiKey: this.api_key,
      pathParameters: { listId: input.listId.toString() },
      body: {
        vids: [],
        emails: [],
      },
    };

    if (input.contacts.length == 0) [];

    const chunks = this.batchUtil.sliceIntoChunks(
      input.contacts,
      maxContactsAdditionsPerRequest
    );

    const requests: RegisterContactsInContactList[] = chunks.map((chunk) => {
      let req = request;
      req.body.vids = [];
      req.body.emails = chunk.map((c) => c.email);
      return req;
    });

    const promises: Promise<
      | SuccessOnAddContactsInContactList
      | ErrorOnAddContactsInDynamicContactList
      | ErrorOnAddContactsInNonExistentList
    >[] = [];

    for (let request of requests) {
      promises.push(this.hubSpotClient.registerContactsInContactList(request));
    }

    return await Promise.all(promises)
      .then((responses) => {
        const statusOfResponses = responses.map((r) => r.status);
        if (statusOfResponses.includes("404"))
          throw new ContactListRepositoryError("Contact list not exists");
        if (statusOfResponses.includes("400"))
          throw new ContactListRepositoryError(
            "Cannot add contact manually in dynamic list"
          );
        return input.contacts;
      })
      .catch((err) => {
        if (err instanceof HubSpotClientError)
          throw new ContactListRepositoryError(err.message);
        throw err;
      });
  }

  async createContactList(
    input: ICreateContactListInput
  ): Promise<ContactList> {
    try {
      const request: RegisterContactList = {
        hapiKey: this.api_key,
        body: {
          name: input.name,
          dynamic: false,
        },
      };

      const response = await this.hubSpotClient.registerContactList(request);
      if (response.status === "200") {
        return new ContactList(response.body.listId, [], input.name);
      }

      throw new ContactListRepositoryError("Cannot create contact list");
    } catch (error) {
      if (error instanceof HubSpotClientError)
        throw new ContactListRepositoryError(error.message);
      throw error;
    }
  }
}

export { HubSpotContactListRepository };
