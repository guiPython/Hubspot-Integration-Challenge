import { Contact } from "../../../../domain/entities/Contact";
import { ContactRepositoryError } from "../../../../domain/ports/repository/Contact";
import { HubSpotContactsClient } from "../client/contact/HubSpotContactsClient";
import {
  RegisterContact,
  RegisterContacts,
} from "../client/contact/requests/HubSpotContactsRequest";
import { HubSpotContactResponse } from "../client/contact/responses/HubSpotContact";
import {
  ErrorOnCreateContact,
  SuccessOnCreateContact,
  ConflitOnCreateContact,
  ErrorOnCreateContacts,
  SuccessOnCreateContacts,
} from "../client/contact/responses/HubSpotContactsResponses";
import { HubSpotClientError } from "../client/shared/error";
import { HubSpotError } from "../client/shared/response";
import { HubSpotContactsRepository } from "./HubSpotContactsRepository";

const mockHubSpotContactsClient: jest.Mocked<HubSpotContactsClient> = {
  registerContact: jest.fn(),
  registerContacts: jest.fn(),
  getAllContacts: jest.fn(),
};

const hubSpotApiKey = "test-test-test";

const mockContact = new Contact({
  name: "Test",
  lastname: "Test",
  email: "test@test.com",
});

beforeEach(() => {
  mockHubSpotContactsClient.registerContact.mockClear();
  mockHubSpotContactsClient.registerContacts.mockClear();
});

describe("Test HubSpotContactsRepository", () => {
  describe("Test HubSpotContactsRepository.createContact", () => {
    it("Should call HubSpotContacts.registerContact once with correct parameters", async () => {
      const sut = new HubSpotContactsRepository(
        hubSpotApiKey,
        mockHubSpotContactsClient
      );

      const mockRegisterContactRequest: RegisterContact = {
        hapiKey: hubSpotApiKey,
        body: {
          properties: [
            {
              property: "firstname",
              value: mockContact.name,
            },
            {
              property: "lastname",
              value: mockContact.lastname,
            },
          ],
        },
        pathParameters: { email: mockContact.email },
      };

      const mockHubSpotContactResponse: HubSpotError = {
        status: "error",
        message: "Error on add contact",
      };

      const mockErrorOnCreateContact: ErrorOnCreateContact = {
        status: "400",
        body: mockHubSpotContactResponse,
      };

      mockHubSpotContactsClient.registerContact.mockResolvedValue(
        mockErrorOnCreateContact
      );

      await expect(sut.createContact(mockContact)).rejects.toThrow(
        new ContactRepositoryError("Malformed contact")
      );
      expect(mockHubSpotContactsClient.registerContact).toHaveBeenCalledTimes(
        1
      );

      expect(mockHubSpotContactsClient.registerContact).toBeCalledWith(
        mockRegisterContactRequest
      );
    });

    it("Should be return true", async () => {
      const sut = new HubSpotContactsRepository(
        hubSpotApiKey,
        mockHubSpotContactsClient
      );

      const mockHubSpotContactResponse: HubSpotContactResponse = {
        vid: 1,
        properties: {
          firstname: { value: mockContact.name },
          lastname: { value: mockContact.lastname },
        },
        "identity-profiles": [
          {
            identities: [
              {
                type: "EMAIL",
                value: mockContact.email,
              },
            ],
          },
        ],
      };

      const mockSuccessOnCreateContact: SuccessOnCreateContact = {
        status: "200",
        body: mockHubSpotContactResponse,
      };

      mockHubSpotContactsClient.registerContact.mockResolvedValue(
        mockSuccessOnCreateContact
      );
      const response = await sut.createContact(mockContact);

      expect(response).toBeTruthy();
    });

    it("Should throw ContactRepositoryError with message 'Malformed contact data'", async () => {
      const sut = new HubSpotContactsRepository(
        hubSpotApiKey,
        mockHubSpotContactsClient
      );

      const mockHubSpotContactResponse: HubSpotError = {
        status: "error",
        message: "Error on add contact",
      };

      const mockErrorOnCreateContact: ErrorOnCreateContact = {
        status: "400",
        body: mockHubSpotContactResponse,
      };

      mockHubSpotContactsClient.registerContact.mockResolvedValue(
        mockErrorOnCreateContact
      );
      await expect(sut.createContact(mockContact)).rejects.toThrow(
        new ContactRepositoryError("Malformed contact")
      );
    });

    it("Should throw ContactRepositoryError with message 'Contact already exists'", async () => {
      const sut = new HubSpotContactsRepository(
        hubSpotApiKey,
        mockHubSpotContactsClient
      );

      const mockHubSpotContactResponse: HubSpotError = {
        status: "error",
        message: "Error on add contact",
      };

      const mockConflitOnCreateContact: ConflitOnCreateContact = {
        status: "409",
        body: mockHubSpotContactResponse,
      };

      mockHubSpotContactsClient.registerContact.mockResolvedValue(
        mockConflitOnCreateContact
      );
      await expect(sut.createContact(mockContact)).rejects.toThrow(
        new ContactRepositoryError("Contact already exists")
      );
    });

    it("Should throw ContactRepositoryError with message 'Not possible add contact in HubSpot'", async () => {
      const sut = new HubSpotContactsRepository(
        hubSpotApiKey,
        mockHubSpotContactsClient
      );

      mockHubSpotContactsClient.registerContact.mockRejectedValue(
        new HubSpotClientError(500, "Not possible add contact in HubSpot")
      );
      await expect(sut.createContact(mockContact)).rejects.toThrow(
        new ContactRepositoryError("Not possible add contact in HubSpot")
      );
    });

    it("Should throw Error", async () => {
      const sut = new HubSpotContactsRepository(
        hubSpotApiKey,
        mockHubSpotContactsClient
      );

      mockHubSpotContactsClient.registerContact.mockRejectedValue(new Error());
      await expect(sut.createContact(mockContact)).rejects.toThrow(new Error());
    });
  });

  describe("Test HubSpotContactsRepository.createContacts", () => {
    it("Should call HubSpotContacts.registerContacts once with correct parameters", async () => {
      const sut = new HubSpotContactsRepository(
        hubSpotApiKey,
        mockHubSpotContactsClient
      );

      const mockRegisterContactsRequest: RegisterContacts = {
        hapiKey: hubSpotApiKey,
        body: [],
      };

      const mockHubSpotContactResponse: HubSpotError = {
        status: "error",
        message: "Error on add contacts",
      };

      const mockErrorOnCreateContacts: ErrorOnCreateContacts = {
        status: "400",
        body: mockHubSpotContactResponse,
      };

      mockHubSpotContactsClient.registerContacts.mockResolvedValue(
        mockErrorOnCreateContacts
      );

      await expect(sut.createContacts([])).rejects.toThrow(
        new ContactRepositoryError(
          "Cannot create some contact in list, aborted operation"
        )
      );
      expect(mockHubSpotContactsClient.registerContacts).toHaveBeenCalledTimes(
        1
      );

      expect(mockHubSpotContactsClient.registerContacts).toBeCalledWith(
        mockRegisterContactsRequest
      );
    });

    it("Should be return true", async () => {
      const sut = new HubSpotContactsRepository(
        hubSpotApiKey,
        mockHubSpotContactsClient
      );

      const mockSuccessOnCreateContacts: SuccessOnCreateContacts = {
        status: "202",
      };

      mockHubSpotContactsClient.registerContacts.mockResolvedValue(
        mockSuccessOnCreateContacts
      );
      const response = await sut.createContacts([mockContact, mockContact]);

      expect(response).toBeTruthy();
    });

    it("Should throw ContactRepositoryError with message 'Cannot create some contact in list, aborted operation'", async () => {
      const sut = new HubSpotContactsRepository(
        hubSpotApiKey,
        mockHubSpotContactsClient
      );

      const mockHubSpotContactResponse: HubSpotError = {
        status: "error",
        message: "Error on add contacts",
      };

      const mockErrorOnCreateContact: ErrorOnCreateContact = {
        status: "400",
        body: mockHubSpotContactResponse,
      };

      mockHubSpotContactsClient.registerContacts.mockResolvedValue(
        mockErrorOnCreateContact
      );
      await expect(
        sut.createContacts([mockContact, mockContact])
      ).rejects.toThrow(
        new ContactRepositoryError(
          "Cannot create some contact in list, aborted operation"
        )
      );
    });

    it("Should throw ContactRepositoryError with message 'Not possible add contacts in HubSpot'", async () => {
      const sut = new HubSpotContactsRepository(
        hubSpotApiKey,
        mockHubSpotContactsClient
      );

      mockHubSpotContactsClient.registerContacts.mockRejectedValue(
        new HubSpotClientError(500, "Not possible add contacts in HubSpot")
      );
      await expect(
        sut.createContacts([mockContact, mockContact])
      ).rejects.toThrow(
        new ContactRepositoryError("Not possible add contacts in HubSpot")
      );
    });

    it("Should throw Error", async () => {
      const sut = new HubSpotContactsRepository(
        hubSpotApiKey,
        mockHubSpotContactsClient
      );

      mockHubSpotContactsClient.registerContact.mockRejectedValue(new Error());
      await expect(sut.createContact(mockContact)).rejects.toThrow(new Error());
    });
  });
});
