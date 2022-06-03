import { HubSpotContactListRepository } from "../contact-list/HubSpotContactListRepository";
import { HubSpotContactListClient } from "../client/contact-list/HubSpotContactListClient";
import {
  GetContactListById,
  RegisterContactList,
  RegisterContactsInContactList,
} from "../client/contact-list/requests/HubSpotContactListRequest";
import {
  ErrorOnAddContactsInDynamicContactList,
  ErrorOnAddContactsInNonExistentList,
  ErrorOnCreateContactList,
  ErrorOnGetContactsInContactList,
  SuccessOnAddContactsInContactList,
  SuccessOnCreateContactList,
  SuccessOnGetContactsInContactList,
} from "../client/contact-list/responses/HubSpotContactListResponses";
import { HubSpotContactResponse } from "../client/contact/responses/HubSpotContact";
import { Contact } from "../../../../domain/entities/Contact";
import {
  ContactListRepositoryError,
  IAddContactInContactListInput,
  ICreateContactListInput,
} from "../../../../domain/ports/repository/ContactList";
import { HubSpotClientError } from "../client/shared/error";
import { ContactList } from "../../../../domain/entities/ContactList";
import { Email } from "../../../../domain/entities/Email";

const mockHubSpotContactListClient: jest.Mocked<HubSpotContactListClient> = {
  getContactsInListById: jest.fn(),
  registerContactList: jest.fn(),
  registerContactsInContactList: jest.fn(),
};

const mockContact = new Contact({
  name: "Test",
  lastname: "Test",
  email: "test@test.com",
});

const hubSpotApiKey = "test-test-test";

beforeEach(() => {
  mockHubSpotContactListClient.getContactsInListById.mockClear();
  mockHubSpotContactListClient.registerContactList.mockClear();
  mockHubSpotContactListClient.registerContactsInContactList.mockClear();
});

describe("Test HubSpotContactListRepository", () => {
  describe("Test findContactsInListById function", () => {
    it("Should call HubSpotContactListClient.getContactsInListById once with correct parameters", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      let request: GetContactListById = {
        hapiKey: hubSpotApiKey,
        pathParameters: { listId: "1", count: "100" },
      };

      let response: SuccessOnGetContactsInContactList = {
        status: "200",
        body: { contacts: [], "has-more": false, "vid-offset": 2 },
      };

      mockHubSpotContactListClient.getContactsInListById.mockResolvedValue(
        response
      );

      await sut.findContactsInListById(1);

      expect(
        mockHubSpotContactListClient.getContactsInListById
      ).toHaveBeenCalledTimes(1);
      expect(mockHubSpotContactListClient.getContactsInListById).toBeCalledWith(
        request
      );
    });

    it("Should be return empty list", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      let response: SuccessOnGetContactsInContactList = {
        status: "200",
        body: { contacts: [], "vid-offset": 2, "has-more": false },
      };

      mockHubSpotContactListClient.getContactsInListById.mockResolvedValue(
        response
      );

      const result = await sut.findContactsInListById(1);

      expect(result).toEqual([]);
    });

    it("Should be return list of contacts", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const hubSpotContactResponse: HubSpotContactResponse = {
        vid: 1,
        properties: {
          firstname: { value: "Test" },
          lastname: { value: "Test" },
        },
        "identity-profiles": [
          {
            identities: [
              {
                type: "EMAIL",
                value: "test@test.com",
              },
            ],
          },
        ],
      };

      let response: SuccessOnGetContactsInContactList = {
        status: "200",
        body: {
          contacts: [hubSpotContactResponse, hubSpotContactResponse],
          "has-more": false,
          "vid-offset": 1,
        },
      };

      const contactResponse = new Contact({
        name: hubSpotContactResponse.properties.firstname.value,
        lastname: hubSpotContactResponse.properties.lastname.value,
        email:
          hubSpotContactResponse["identity-profiles"][0].identities[0].value,
      });

      mockHubSpotContactListClient.getContactsInListById.mockResolvedValue(
        response
      );

      const result = await sut.findContactsInListById(1);

      expect(result.length).toEqual(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: mockContact.name,
            lastname: mockContact.lastname,
            _email: Email.create(mockContact.email),
          }),
        ])
      );
    });

    it("Should throw ContactListRepositoryError with message 'Contact list does not exist'", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const mock404Response: ErrorOnGetContactsInContactList = {
        status: "404",
        body: {
          status: "error",
          message: "List not exists",
        },
      };

      const mock400Response = mock404Response;
      mock400Response.status = "400";

      mockHubSpotContactListClient.getContactsInListById.mockResolvedValue(
        mock404Response
      );

      await expect(sut.findContactsInListById(1)).rejects.toThrow(
        new ContactListRepositoryError("Contact list does not exist")
      );

      mockHubSpotContactListClient.getContactsInListById.mockResolvedValue(
        mock400Response
      );

      await expect(sut.findContactsInListById(1)).rejects.toThrow(
        new ContactListRepositoryError("Contact list does not exist")
      );
    });

    it("Should throw ContactListRepositoryError with message 'Not possible get contacts of list in HubSpot'", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      mockHubSpotContactListClient.getContactsInListById.mockRejectedValue(
        new HubSpotClientError(
          500,
          "Not possible get contacts of list in HubSpot"
        )
      );

      await expect(sut.findContactsInListById(1)).rejects.toThrow(
        new ContactListRepositoryError(
          "Not possible get contacts of list in HubSpot"
        )
      );
    });

    it("Should throw Error", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      mockHubSpotContactListClient.getContactsInListById.mockRejectedValue(
        new Error()
      );

      await expect(sut.findContactsInListById(1)).rejects.toThrow(new Error());
    });
  });

  describe("Test addContactsInContactList function", () => {
    it("Shouldn't call HubSpotContacts.registerContacts", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const input: IAddContactInContactListInput = {
        listId: 1,
        contacts: [],
      };

      const response: SuccessOnAddContactsInContactList = {
        status: "200",
        body: {
          updated: [],
          discarded: [],
          invalidEmails: [],
          invalidVids: [],
        },
      };

      mockHubSpotContactListClient.registerContactsInContactList.mockResolvedValue(
        response
      );

      await sut.addContactsInContactList(input);

      expect(
        mockHubSpotContactListClient.getContactsInListById
      ).toHaveBeenCalledTimes(0);
    });

    it("Should call HubSpotContacts.registerContacts once with correct parameters", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const request: RegisterContactsInContactList = {
        hapiKey: hubSpotApiKey,
        pathParameters: { listId: "1" },
        body: {
          emails: [mockContact.email],
          vids: [],
        },
      };

      const input: IAddContactInContactListInput = {
        listId: 1,
        contacts: [mockContact],
      };

      const response: SuccessOnAddContactsInContactList = {
        status: "200",
        body: {
          updated: [],
          discarded: [],
          invalidEmails: [],
          invalidVids: [],
        },
      };

      mockHubSpotContactListClient.registerContactsInContactList.mockResolvedValue(
        response
      );

      await sut.addContactsInContactList(input);

      expect(
        mockHubSpotContactListClient.registerContactsInContactList
      ).toHaveBeenCalledTimes(1);
      expect(
        mockHubSpotContactListClient.registerContactsInContactList
      ).toBeCalledWith(request);
    });

    it("Should call HubSpotContacts.registerContacts two times with correct parameters", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const listWithFiveHundredContacts = [];
      for (let i = 0; i < 500; i++)
        listWithFiveHundredContacts.push(mockContact.email);

      const request: RegisterContactsInContactList = {
        hapiKey: hubSpotApiKey,
        pathParameters: { listId: "1" },
        body: {
          emails: listWithFiveHundredContacts,
          vids: [],
        },
      };

      const listWithOnethousandContacts = [];
      for (let i = 0; i < 1000; i++)
        listWithOnethousandContacts.push(mockContact);

      const input: IAddContactInContactListInput = {
        listId: 1,
        contacts: listWithOnethousandContacts,
      };

      const response: SuccessOnAddContactsInContactList = {
        status: "200",
        body: {
          updated: [],
          discarded: [],
          invalidEmails: [],
          invalidVids: [],
        },
      };

      mockHubSpotContactListClient.registerContactsInContactList.mockResolvedValue(
        response
      );

      await sut.addContactsInContactList(input);

      expect(
        mockHubSpotContactListClient.registerContactsInContactList
      ).toHaveBeenCalledTimes(2);
      expect(
        mockHubSpotContactListClient.registerContactsInContactList
      ).toBeCalledWith(request);
    });

    it("Should be return true", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const mockResponse: SuccessOnAddContactsInContactList = {
        status: "200",
        body: {
          updated: [],
          discarded: [],
          invalidEmails: [],
          invalidVids: [],
        },
      };

      const input: IAddContactInContactListInput = {
        listId: 1,
        contacts: [mockContact],
      };

      mockHubSpotContactListClient.registerContactsInContactList.mockResolvedValue(
        mockResponse
      );

      const result = await sut.addContactsInContactList(input);
      expect(result).toBeTruthy();
    });

    it("Should throw ContactListRepositoryError with message 'Contact list not exists'", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const mockResponse: ErrorOnAddContactsInNonExistentList = {
        status: "404",
        body: {
          status: "error",
          message: "List not exist",
        },
      };

      const input: IAddContactInContactListInput = {
        listId: 1,
        contacts: [mockContact],
      };

      mockHubSpotContactListClient.registerContactsInContactList.mockResolvedValue(
        mockResponse
      );

      await expect(sut.addContactsInContactList(input)).rejects.toThrow(
        new ContactListRepositoryError("Contact list not exists")
      );
    });

    it("Should throw ContactListRepositoryError with message 'Cannot add contact manually in dynamic list'", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const mockResponse: ErrorOnAddContactsInDynamicContactList = {
        status: "400",
        body: {
          status: "error",
          message: "Cannot add contact manually in dynamic list",
        },
      };

      const input: IAddContactInContactListInput = {
        listId: 1,
        contacts: [mockContact],
      };

      mockHubSpotContactListClient.registerContactsInContactList.mockResolvedValue(
        mockResponse
      );

      await expect(sut.addContactsInContactList(input)).rejects.toThrow(
        new ContactListRepositoryError(
          "Cannot add contact manually in dynamic list"
        )
      );
    });

    it("Should throw ContactListRepositoryError with message 'Not possible add contacts to list on HubSpot'", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const input: IAddContactInContactListInput = {
        listId: 1,
        contacts: [mockContact],
      };

      mockHubSpotContactListClient.registerContactsInContactList.mockRejectedValue(
        new HubSpotClientError(
          500,
          "Not possible add contacts to list on HubSpot"
        )
      );

      await expect(sut.addContactsInContactList(input)).rejects.toThrow(
        new ContactListRepositoryError(
          "Not possible add contacts to list on HubSpot"
        )
      );
    });

    it("Should throw Error", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const input: IAddContactInContactListInput = {
        listId: 1,
        contacts: [mockContact],
      };

      mockHubSpotContactListClient.registerContactsInContactList.mockRejectedValue(
        new Error()
      );

      await expect(sut.addContactsInContactList(input)).rejects.toThrow(
        new Error()
      );
    });
  });

  describe("Test createContactList function", () => {
    it("Should call HubSpotContacts.registerContactList once with correct parameters", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const request: RegisterContactList = {
        hapiKey: hubSpotApiKey,
        body: {
          name: "Test List",
          dynamic: false,
        },
      };

      const response: SuccessOnCreateContactList = {
        status: "200",
        body: { listId: 1, internalListId: 1, name: "Test List" },
      };

      const input: ICreateContactListInput = {
        name: "Test List",
      };

      mockHubSpotContactListClient.registerContactList.mockResolvedValue(
        response
      );

      await sut.createContactList(input);

      expect(
        mockHubSpotContactListClient.registerContactList
      ).toHaveBeenCalledTimes(1);
      expect(mockHubSpotContactListClient.registerContactList).toBeCalledWith(
        request
      );
    });

    it("Should be return contact list", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const mockResponse: SuccessOnCreateContactList = {
        status: "200",
        body: {
          name: "Test List",
          listId: 1,
          internalListId: 1,
        },
      };

      const input: ICreateContactListInput = {
        name: "Test List",
      };

      mockHubSpotContactListClient.registerContactList.mockResolvedValue(
        mockResponse
      );

      const result = await sut.createContactList(input);
      expect(result).toEqual(
        new ContactList(mockResponse.body.listId, [], mockResponse.body.name)
      );
    });

    it("Should throw ContactListRepositoryError with message 'Cannot create contact list'", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const mockResponse: ErrorOnCreateContactList = {
        status: "400",
        body: {
          status: "error",
          message: "Cannot create contact list",
        },
      };

      const input: ICreateContactListInput = {
        name: "Test List",
      };

      mockHubSpotContactListClient.registerContactList.mockResolvedValue(
        mockResponse
      );

      await expect(sut.createContactList(input)).rejects.toThrow(
        new ContactListRepositoryError("Cannot create contact list")
      );
    });

    it("Should throw ContactListRepositoryError with message 'Not possible add contact list on HubSpot'", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      const input: ICreateContactListInput = {
        name: "Test List",
      };

      mockHubSpotContactListClient.registerContactList.mockRejectedValue(
        new HubSpotClientError(500, "Not possible add contact list on HubSpot")
      );

      await expect(sut.createContactList(input)).rejects.toThrow(
        new ContactListRepositoryError(
          "Not possible add contact list on HubSpot"
        )
      );
    });

    it("Should throw Error", async () => {
      const sut = new HubSpotContactListRepository(
        hubSpotApiKey,
        mockHubSpotContactListClient
      );

      mockHubSpotContactListClient.getContactsInListById.mockRejectedValue(
        new Error()
      );

      await expect(sut.findContactsInListById(1)).rejects.toThrow(new Error());
    });
  });
});
