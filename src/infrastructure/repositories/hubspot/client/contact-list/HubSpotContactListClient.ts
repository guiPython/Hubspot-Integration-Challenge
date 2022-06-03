import { HubSpotError } from "../shared/response";
import axios from "axios";

import { HubSpotContactListResponse } from "./responses/HubSpotContactList";
import { HubSpotClientError } from "../shared/error";

import {
  RegisterContactList,
  GetContactListById,
  RegisterContactsInContactList,
} from "./requests/HubSpotContactListRequest";
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

interface IHubSpotContactListClient {
  registerContactList(
    request: RegisterContactList
  ): Promise<SuccessOnCreateContactList | ErrorOnCreateContactList>;

  getContactsInListById(
    request: GetContactListById
  ): Promise<
    SuccessOnGetContactsInContactList | ErrorOnGetContactsInContactList
  >;

  registerContactsInContactList(
    request: RegisterContactsInContactList
  ): Promise<
    | SuccessOnAddContactsInContactList
    | ErrorOnAddContactsInNonExistentList
    | ErrorOnAddContactsInDynamicContactList
  >;
}

class HubSpotContactListClient implements IHubSpotContactListClient {
  async registerContactsInContactList(
    request: RegisterContactsInContactList
  ): Promise<
    | SuccessOnAddContactsInContactList
    | ErrorOnAddContactsInNonExistentList
    | ErrorOnAddContactsInDynamicContactList
  > {
    try {
      const response = await axios.post<
        AddContactsInContactListResponse | HubSpotError
      >(
        `https://api.hubapi.com/contacts/v1/lists/${request.pathParameters.listId}/add/?hapikey=${request.hapiKey}`,
        request.body
      );

      const body = response.data as AddContactsInContactListResponse;
      return { status: "200", body: body };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const body = error.response.data as HubSpotError;
        if (error.response.status === 400) return { status: "400", body: body };
        if (error.response.status === 404) return { status: "404", body: body };
        throw new HubSpotClientError(
          error.response.status,
          "Not possible add contacts to list on HubSpot"
        );
      }
    }
  }

  async registerContactList(
    request: RegisterContactList
  ): Promise<SuccessOnCreateContactList | ErrorOnCreateContactList> {
    try {
      const response = await axios.post<
        HubSpotContactListResponse | HubSpotError
      >(
        `https://api.hubapi.com/contacts/v1/lists?hapikey=${request.hapiKey}`,
        request.body
      );

      const body = response.data as HubSpotContactListResponse;
      return { status: "200", body: body };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const body = error.response.data as HubSpotError;
        if (error.response.status === 400) return { status: "400", body: body };
        throw new HubSpotClientError(
          error.response.status,
          "Not possible add contact list on HubSpot"
        );
      }
    }
  }

  async getContactsInListById(
    request: GetContactListById
  ): Promise<
    SuccessOnGetContactsInContactList | ErrorOnGetContactsInContactList
  > {
    try {
      let url = `https://api.hubapi.com/contacts/v1/lists/${request.pathParameters.listId}/contacts/all?hapikey=${request.hapiKey}&count=${request.pathParameters.count}`;
      let vidOffset = request.pathParameters.vidOffset;
      if (vidOffset) {
        url += `&vidOffset=${request.pathParameters.vidOffset}`;
      }
      const response = await axios.get<
        GetContactsInContactListResponse | HubSpotError
      >(url);

      const body = response.data as GetContactsInContactListResponse;
      return { status: "200", body: body };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const body = error.response.data as HubSpotError;
        if (error.response.status === 400) return { status: "400", body: body };
        if (error.response.status === 404) return { status: "404", body: body };
        throw new HubSpotClientError(
          error.response.status,
          "Not possible get contacts of list in HubSpot"
        );
      }
    }
  }
}

export { IHubSpotContactListClient, HubSpotContactListClient };
