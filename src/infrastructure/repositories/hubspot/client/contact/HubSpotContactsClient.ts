import axios from "axios";

import { HubSpotError } from "../shared/response";

import {
  RegisterContact,
  RegisterContacts,
  GetAllContacts,
} from "./requests/HubSpotContactsRequest";
import {
  SuccessOnCreateContact,
  ConflitOnCreateContact,
  ErrorOnCreateContact,
  SuccessOnCreateContacts,
  ErrorOnCreateContacts,
  SuccessOnGetAllContacts,
  SuccesOnGetAllContactsBody,
} from "./responses/HubSpotContactsResponses";
import { HubSpotContactResponse } from "./responses/HubSpotContact";
import { HubSpotClientError } from "../shared/error";

interface IHubSpotContactsClient {
  registerContact(
    request: RegisterContact
  ): Promise<
    SuccessOnCreateContact | ConflitOnCreateContact | ErrorOnCreateContact
  >;

  registerContacts(
    request: RegisterContacts
  ): Promise<SuccessOnCreateContacts | ErrorOnCreateContacts>;

  getAllContacts(request: GetAllContacts): Promise<SuccessOnGetAllContacts>;
}

class HubSpotContactsClient implements IHubSpotContactsClient {
  async getAllContacts(
    request: GetAllContacts
  ): Promise<SuccessOnGetAllContacts> {
    try {
      let url = `https://api.hubapi.com/contacts/v1/lists/all/contacts/all?hapikey=${request.hapiKey}&count=${request.pathParameter.count}`;
      let vidOffset = request.pathParameter.vidOffset;
      if (vidOffset) {
        url += `&vidOffset=${request.pathParameter.vidOffset}`;
      }

      const response = await axios.get<
        SuccesOnGetAllContactsBody | HubSpotError
      >(url);

      const body = response.data as SuccesOnGetAllContactsBody;
      return { status: "200", body: body };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HubSpotClientError(
          error.response.status,
          "Not possible get all contacts in HubSpot"
        );
      }
    }
  }

  async registerContact(
    request: RegisterContact
  ): Promise<
    SuccessOnCreateContact | ConflitOnCreateContact | ErrorOnCreateContact
  > {
    try {
      const response = await axios.post<HubSpotContactResponse | HubSpotError>(
        `https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/${request.pathParameters.email}/?hapikey=${request.hapiKey}`,
        request.body
      );
      const body = response.data as HubSpotContactResponse;
      return { status: "200", body: body };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const body = error.response.data as HubSpotError;
        if (error.response.status === 409) return { status: "409", body: body };

        if (error.response.status === 400) return { status: "400", body: body };

        throw new HubSpotClientError(
          error.response.status,
          "Not possible add contact in HubSpot"
        );
      }
    }
  }

  async registerContacts(
    request: RegisterContacts
  ): Promise<SuccessOnCreateContacts | ErrorOnCreateContacts> {
    try {
      await axios.post<HubSpotError>(
        `https://api.hubapi.com/contacts/v1/contact/batch/?hapikey=${request.hapiKey}`,
        request.body
      );

      return { status: "202" };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const body = error.response.data as HubSpotError;
        if (error.response.status === 400) return { status: "400", body: body };
        throw new HubSpotClientError(
          error.response.status,
          "Not possible add contacts in HubSpot"
        );
      }
    }
  }
}

export { IHubSpotContactsClient, HubSpotContactsClient };
