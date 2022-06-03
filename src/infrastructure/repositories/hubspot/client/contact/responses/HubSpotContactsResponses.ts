import { HubSpotResponse, HubSpotError } from "../../shared/response";

import { HubSpotContactResponse } from "./HubSpotContact";

/* 
 POST /contacts/v1/contact
 200 Contact created
 409 Conflit on create contact (already exists)
 400 Malformed contact
 doc: https://legacydocs.hubspot.com/docs/methods/contacts/create_contact
*/

interface SuccessOnCreateContact extends HubSpotResponse {
  status: "200";
  body: HubSpotContactResponse;
}

interface ConflitOnCreateContact extends HubSpotResponse {
  status: "409";
  body: HubSpotError;
}

interface ErrorOnCreateContact extends HubSpotResponse {
  status: "400";
  body: HubSpotError;
}

/*
  POST /contacts/v1/contact/batch;
  202 All contacts created
  400 Cannot create some contact
  doc: https://legacydocs.hubspot.com/docs/methods/contacts/batch_create_or_update
*/

interface SuccessOnCreateContacts extends HubSpotResponse {
  status: "202";
  body?: never;
}

interface ErrorOnCreateContacts extends HubSpotResponse {
  status: "400";
  body: HubSpotError;
}

/*
  GET /contacts/v1/lists/all/contacts/all
  doc: https://legacydocs.hubspot.com/docs/methods/contacts/get_contacts
*/

interface SuccesOnGetAllContactsBody {
  contacts: HubSpotContactResponse[];
  "has-more": boolean;
  "vid-offset": number;
}

interface SuccessOnGetAllContacts extends HubSpotResponse {
  status: "200";
  body: SuccesOnGetAllContactsBody;
}

export {
  SuccessOnCreateContact,
  ConflitOnCreateContact,
  ErrorOnCreateContact,
  SuccessOnCreateContacts,
  ErrorOnCreateContacts,
  SuccessOnGetAllContacts,
  SuccesOnGetAllContactsBody,
};
