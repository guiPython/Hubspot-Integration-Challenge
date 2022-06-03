import nock from "nock";

import { HubSpotContactListClient } from "./HubSpotContactListClient";
import {
  GetContactListById,
  RegisterContactList,
  RegisterContactsInContactList,
} from "./requests/HubSpotContactListRequest";
import { HubSpotContactListResponse } from "./responses/HubSpotContactList";
import {
  AddContactsInContactListResponse,
  ErrorOnAddContactsInDynamicContactList,
  ErrorOnAddContactsInNonExistentList,
  ErrorOnCreateContactList,
  ErrorOnGetContactsInContactList,
  GetContactsInContactListResponse,
  SuccessOnAddContactsInContactList,
  SuccessOnCreateContactList,
  SuccessOnGetContactsInContactList,
} from "./responses/HubSpotContactListResponses";
import { HubSpotClientError } from "../shared/error";
import { HubSpotError } from "../shared/response";

const hubSpotBaseUrlContactListV1 = "https://api.hubapi.com/contacts/v1/lists";
const hubSpotContactList = new HubSpotContactListClient();
const hubSpotError: HubSpotError = {
  message: "",
  status: "",
};

//#region Mocks HubSpotContacts.registerContactList
//#region Requests
const endpointForRegisterContactList = "?hapikey=$API_KEY$";
const registerContactListRequest: RegisterContactList = {
  hapiKey: "test-test-test",
  body: {
    name: "Test List",
    dynamic: false,
  },
};
//#endregion
//#region Responses

const registerContactListResponse: HubSpotContactListResponse = {
  listId: 1,
  internalListId: 1,
  name: registerContactListRequest.body.name,
};

const status200OnRegisterContactList: SuccessOnCreateContactList = {
  status: "200",
  body: registerContactListResponse,
};

const status400OnRegisterContactList: ErrorOnCreateContactList = {
  status: "400",
  body: {
    status: "",
    message: "",
  },
};
//#endregion
//#endregion

//#region Mocks HubSpotContacts.getContactsInListById
//#region Requests
const endpointForGetContactsInContactList =
  "/$LIST_ID$/contacts/all?hapikey=$API_KEY$&count=100";

const getContactsInContactListRequest: GetContactListById = {
  hapiKey: "test-test-test",
  pathParameters: {
    listId: "1",
    count: "100",
  },
};
//#endregion
//#region Responses
const contactsInContactListResponse: GetContactsInContactListResponse = {
  contacts: [],
  "vid-offset": 1,
  "has-more": true,
};

const status200OnGetContactsInContactList: SuccessOnGetContactsInContactList = {
  status: "200",
  body: contactsInContactListResponse,
};

const status400OnGetContactsInContactList: ErrorOnGetContactsInContactList = {
  status: "400",
  body: hubSpotError,
};

const status404OnGetContactsInContactList: ErrorOnGetContactsInContactList = {
  status: "404",
  body: hubSpotError,
};
//#endregion
//#endregion

//#region Mocks HubSpotContacts.registerContactsInContactList
//#region Requests
const endpointForRegisterContactsInContactList =
  "/$LIST_ID$/add/?hapikey=$API_KEY$";

const registerContactsInContactListRequest: RegisterContactsInContactList = {
  hapiKey: "test-test-test",
  pathParameters: {
    listId: "1",
  },
  body: {
    vids: [],
    emails: [],
  },
};
//#endregion
//#region Responses
const addContactsInContactListResponse: AddContactsInContactListResponse = {
  updated: [],
  discarded: [],
  invalidEmails: [],
  invalidVids: [],
};

const status200OnAddContactsInContactList: SuccessOnAddContactsInContactList = {
  status: "200",
  body: addContactsInContactListResponse,
};

const status404OnAddContactsInContactList: ErrorOnAddContactsInNonExistentList =
  {
    status: "404",
    body: hubSpotError,
  };

const status400OnAddContactsInContactList: ErrorOnAddContactsInDynamicContactList =
  {
    status: "400",
    body: hubSpotError,
  };
//#endregion
//#endregion

describe("Test Client HubSpotContactList", () => {
  describe("Test HubSpotContactList.registerContactList", () => {
    const endpoint = endpointForRegisterContactList.replace(
      "$API_KEY$",
      registerContactListRequest.hapiKey
    );

    it("Should be return SuccessOnCreateContactList", async () => {
      const expected: SuccessOnCreateContactList =
        status200OnRegisterContactList;

      nock(hubSpotBaseUrlContactListV1)
        .post(endpoint)
        .reply(200, registerContactListResponse);

      const response = await hubSpotContactList.registerContactList(
        registerContactListRequest
      );
      expect(response).toEqual(expected);
    });

    it("Should be return ErrorOnCreateContactList", async () => {
      const expected: ErrorOnCreateContactList = status400OnRegisterContactList;

      nock(hubSpotBaseUrlContactListV1).post(endpoint).reply(400, hubSpotError);

      const response = await hubSpotContactList.registerContactList(
        registerContactListRequest
      );
      expect(response).toEqual(expected);
    });

    it("Should throw Error with message 'Not possible register contact list' for invalid response status", async () => {
      nock(hubSpotBaseUrlContactListV1).post(endpoint).reply(500);

      await expect(
        hubSpotContactList.registerContactList(registerContactListRequest)
      ).rejects.toThrow(
        new HubSpotClientError(500, "Not possible add contact list on HubSpot")
      );
    });
  });

  describe("Test HubSpotContactList.getContactsInListById", () => {
    const endpoint = endpointForGetContactsInContactList
      .replace(
        "$LIST_ID$",
        getContactsInContactListRequest.pathParameters.listId
      )
      .replace("$API_KEY$", getContactsInContactListRequest.hapiKey);

    it("Should be return SuccessOnGetContactList", async () => {
      const expected = status200OnGetContactsInContactList;
      nock(hubSpotBaseUrlContactListV1)
        .get(endpoint)
        .reply(200, contactsInContactListResponse);

      const result = await hubSpotContactList.getContactsInListById(
        getContactsInContactListRequest
      );
      expect(result).toEqual(expected);
    });

    it("Should be return ErrorOnGetContactList", async () => {
      const expected400 = status400OnGetContactsInContactList;
      nock(hubSpotBaseUrlContactListV1).get(endpoint).reply(400, hubSpotError);

      let result = await hubSpotContactList.getContactsInListById(
        getContactsInContactListRequest
      );

      expect(result).toEqual(expected400);

      const expected404 = status404OnGetContactsInContactList;
      nock(hubSpotBaseUrlContactListV1).get(endpoint).reply(404, hubSpotError);

      result = await hubSpotContactList.getContactsInListById(
        getContactsInContactListRequest
      );

      expect(result).toEqual(expected404);
    });

    it("Should throw Error with message 'Not possible get contacts in contact list' for invalid response status", async () => {
      nock(hubSpotBaseUrlContactListV1)
        .get(endpoint)
        .reply(500, contactsInContactListResponse);

      await expect(
        hubSpotContactList.getContactsInListById(
          getContactsInContactListRequest
        )
      ).rejects.toThrowError(
        new HubSpotClientError(
          500,
          "Not possible get contacts of list in HubSpot"
        )
      );
    });
  });

  describe("Test HubSpotContactList.registerContactsInContactList", () => {
    const endpoint = endpointForRegisterContactsInContactList
      .replace(
        "$LIST_ID$",
        registerContactsInContactListRequest.pathParameters.listId
      )
      .replace("$API_KEY$", registerContactsInContactListRequest.hapiKey);

    it("Should be return SuccessOnAddContactsInContactList", async () => {
      const expected = status200OnAddContactsInContactList;
      nock(hubSpotBaseUrlContactListV1)
        .post(endpoint)
        .reply(200, addContactsInContactListResponse);

      const result = await hubSpotContactList.registerContactsInContactList(
        registerContactsInContactListRequest
      );
      expect(result).toEqual(expected);
    });

    it("Should be return ErrorOnAddContactsInNonExistentList", async () => {
      const expected = status404OnAddContactsInContactList;
      nock(hubSpotBaseUrlContactListV1).post(endpoint).reply(404, hubSpotError);

      const result = await hubSpotContactList.registerContactsInContactList(
        registerContactsInContactListRequest
      );
      expect(result).toEqual(expected);
    });

    it("Should be return ErrorOnAddContactsInDynamicContactList", async () => {
      const expected = status400OnAddContactsInContactList;
      nock(hubSpotBaseUrlContactListV1).post(endpoint).reply(400, hubSpotError);

      const result = await hubSpotContactList.registerContactsInContactList(
        registerContactsInContactListRequest
      );
      expect(result).toEqual(expected);
    });

    it("Should throw Error with message 'Not possible register contacts in contact list' for invalid response status", async () => {
      nock(hubSpotBaseUrlContactListV1).post(endpoint).reply(500);

      await expect(
        hubSpotContactList.registerContactsInContactList(
          registerContactsInContactListRequest
        )
      ).rejects.toThrow(
        new HubSpotClientError(
          500,
          "Not possible add contacts to list on HubSpot"
        )
      );
    });
  });
});
