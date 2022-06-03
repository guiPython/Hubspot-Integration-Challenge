import nock from "nock";

import { HubSpotContactsClient } from "./HubSpotContactsClient";

import {
  RegisterContact,
  RegisterContacts,
  HubSpotContactBatch,
  HubSpotContactRequest,
  GetAllContacts,
} from "./requests/HubSpotContactsRequest";
import { HubSpotContactResponse } from "./responses/HubSpotContact";

import {
  SuccessOnCreateContact,
  SuccessOnCreateContacts,
  ConflitOnCreateContact,
  ErrorOnCreateContact,
  ErrorOnCreateContacts,
  SuccessOnGetAllContacts,
} from "./responses/HubSpotContactsResponses";
import { HubSpotClientError } from "../shared/error";
import { HubSpotError } from "../shared/response";

const hubSpotBaseUrlContactV1 = "https://api.hubapi.com/contacts/v1/contact";
const hubSpotBaseUrlGetAllContactsV1 =
  "https://api.hubapi.com/contacts/v1/lists/all/contacts/all";
const hubSpotContacts = new HubSpotContactsClient();
const hubSpotError: HubSpotError = {
  status: "",
  message: "",
};

//#region Mocks HubSpotContact.registerContact
//#region Requests
const endpointForGetAllContacts = "?hapikey=$API_KEY$&count=$COUNT$";

const endpointForGetAllContactsWithOffset =
  endpointForGetAllContacts + "&vidOffset=$VID_OFFSET$";

const getAllContactsRequest: GetAllContacts = {
  hapiKey: "test-test-test",
  pathParameter: { count: "100" },
};

const getAllContactsRequestWithVidOffset: GetAllContacts = {
  hapiKey: "test-test-test",
  pathParameter: { count: "100", vidOffset: "1" },
};
//#endregion
//#region Response
const mockGetAllContactsResponseWithHasMore = {
  contacts: [],
  "vid-offset": 1,
  "has-more": true,
};

const mockGetAllContactsResponseWithoutHasMore = {
  contacts: [],
  "vid-offset": 1,
  "has-more": false,
};

const successOnGetAllContactsWithHasMore: SuccessOnGetAllContacts = {
  status: "200",
  body: {
    contacts: [],
    "vid-offset": 1,
    "has-more": true,
  },
};

const successOnGetAllContactsWithoutHasMore: SuccessOnGetAllContacts = {
  status: "200",
  body: {
    contacts: [],
    "vid-offset": 1,
    "has-more": false,
  },
};
//#endregion
//#endregion

//#region Mocks HubSpotContact.registerContact
//#region Request
const endpointForRegisterContact = `/createOrUpdate/email/$EMAIL$/?hapikey=$API_KEY$`;

const registerContactBody: HubSpotContactRequest = {
  properties: [
    { property: "firstname", value: "Test" },
    { property: "lastname", value: "Test" },
  ],
};

const registerContactRequest: RegisterContact = {
  pathParameters: { email: "test@test.com" },
  hapiKey: "test-test-test",
  body: registerContactBody,
};
//#endregion
//#region Response

const contactResponse: HubSpotContactResponse = {
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

const status200BodyCreateContact: SuccessOnCreateContact = {
  status: "200",
  body: contactResponse,
};

const status409BodyCreateContact: ConflitOnCreateContact = {
  status: "409",
  body: hubSpotError,
};

const status400BodyCreateContact: ErrorOnCreateContact = {
  status: "400",
  body: hubSpotError,
};
//#endregion
//#endregion

//#region Mocks HubSpotContact.registerContacts
//#region Request
const endpointForRegisterContacts = "/batch/?hapikey=$API_KEY$";
const registerContactsBody: HubSpotContactBatch = {
  email: "test@test.com",
  properties: [
    { property: "firstname", value: "Test" },
    { property: "lastname", value: "Test" },
  ],
};

const registerContactsRequest: RegisterContacts = {
  hapiKey: "test-test-test",
  body: [registerContactsBody, registerContactsBody],
};
//#endregion
//#region Response
const status400BodyCreateContacts: ErrorOnCreateContacts = {
  status: "400",
  body: {
    status: "",
    message: "",
  },
};
//#endregion
//#endregion

describe("Test Client HubSpotContacts", () => {
  describe("Test HubSpotContact.getAllContacts", () => {
    const endpoint = endpointForGetAllContacts
      .replace("$API_KEY$", "test-test-test")
      .replace("$COUNT$", "100");

    const endpointWithOffset = endpointForGetAllContactsWithOffset
      .replace("$API_KEY$", "test-test-test")
      .replace("$COUNT$", "100")
      .replace("$VID_OFFSET$", "1");

    it("Should be return SuccesOnGetAllContacts for requests without vidOfset", async () => {
      const expected: SuccessOnGetAllContacts =
        successOnGetAllContactsWithoutHasMore;
      nock(hubSpotBaseUrlGetAllContactsV1)
        .get(endpoint)
        .reply(200, mockGetAllContactsResponseWithoutHasMore);

      let response = await hubSpotContacts.getAllContacts(
        getAllContactsRequest
      );

      expect(response).toEqual(expected);

      nock(hubSpotBaseUrlGetAllContactsV1)
        .get(endpoint)
        .reply(200, mockGetAllContactsResponseWithHasMore);

      response = await hubSpotContacts.getAllContacts(getAllContactsRequest);

      expect(response).toEqual(successOnGetAllContactsWithHasMore);
    });

    it("Should be return SuccesOnGetAllContacts for requests with vidOffset", async () => {
      const expected: SuccessOnGetAllContacts =
        successOnGetAllContactsWithoutHasMore;
      nock(hubSpotBaseUrlGetAllContactsV1)
        .get(endpointWithOffset)
        .reply(200, mockGetAllContactsResponseWithoutHasMore);

      let response = await hubSpotContacts.getAllContacts(
        getAllContactsRequestWithVidOffset
      );

      expect(response).toEqual(expected);

      nock(hubSpotBaseUrlGetAllContactsV1)
        .get(endpointWithOffset)
        .reply(200, mockGetAllContactsResponseWithHasMore);

      response = await hubSpotContacts.getAllContacts(
        getAllContactsRequestWithVidOffset
      );

      expect(response).toEqual(successOnGetAllContactsWithHasMore);
    });

    it("Should throw HubSpotClientError with message 'Not possible get all contacts in HubSpot' for invalid response status", async () => {
      nock(hubSpotBaseUrlGetAllContactsV1).get(endpoint).reply(500);

      await expect(
        hubSpotContacts.getAllContacts(getAllContactsRequest)
      ).rejects.toThrowError(
        new HubSpotClientError(500, "Not possible get all contacts in HubSpot")
      );
    });
  });

  describe("Test HubSpotContact.registerContact", () => {
    const endpoint = endpointForRegisterContact
      .replace("$EMAIL$", registerContactRequest.pathParameters.email)
      .replace("$API_KEY$", registerContactRequest.hapiKey);

    it("Should be return SuccesOnCreateContact", async () => {
      const expected: SuccessOnCreateContact = status200BodyCreateContact;

      nock(hubSpotBaseUrlContactV1).post(endpoint).reply(200, contactResponse);

      const response = await hubSpotContacts.registerContact(
        registerContactRequest
      );

      expect(response).toEqual(expected);
    });

    it("Should be return ConflitOnCreateContact", async () => {
      const expected: ConflitOnCreateContact = status409BodyCreateContact;

      nock(hubSpotBaseUrlContactV1).post(endpoint).reply(409, hubSpotError);

      const response = await hubSpotContacts.registerContact(
        registerContactRequest
      );

      expect(response).toEqual(expected);
    });

    it("Should be return ErrorOnCreateContact", async () => {
      const expected: ErrorOnCreateContact = status400BodyCreateContact;

      nock(hubSpotBaseUrlContactV1).post(endpoint).reply(400, hubSpotError);

      const response = await hubSpotContacts.registerContact(
        registerContactRequest
      );

      expect(response).toEqual(expected);
    });

    it("Should throw HubSpotClientError with message 'Not possible add contact in HubSpot' for invalid response status", async () => {
      nock(hubSpotBaseUrlContactV1).post(endpoint).reply(500);

      await expect(
        hubSpotContacts.registerContact(registerContactRequest)
      ).rejects.toThrowError(
        new HubSpotClientError(500, "Not possible add contact in HubSpot")
      );
    });
  });

  describe("Test HubSpotContact.registerContacts", () => {
    const endpoint = endpointForRegisterContacts.replace(
      "$API_KEY$",
      registerContactsRequest.hapiKey
    );

    it("Should be return SuccesOnCreateContacts", async () => {
      const expected: SuccessOnCreateContacts = {
        status: "202",
      };

      nock(hubSpotBaseUrlContactV1).post(endpoint).reply(202);

      const response = await hubSpotContacts.registerContacts(
        registerContactsRequest
      );

      expect(response).toEqual(expected);
    });

    it("Should be return ErrorOnCreateContacts", async () => {
      const expected: ErrorOnCreateContacts = status400BodyCreateContacts;

      nock(hubSpotBaseUrlContactV1).post(endpoint).reply(400, hubSpotError);

      const response = await hubSpotContacts.registerContacts(
        registerContactsRequest
      );

      expect(response).toEqual(expected);
    });

    it("Should throw HubSpotClientError with message 'Not possible add contacts in HubSpot' for invalid response status", async () => {
      nock(hubSpotBaseUrlContactV1).post(endpoint).reply(500);

      await expect(
        hubSpotContacts.registerContacts(registerContactsRequest)
      ).rejects.toThrowError(
        new HubSpotClientError(500, "Not possible add contacts in HubSpot")
      );
    });
  });
});
