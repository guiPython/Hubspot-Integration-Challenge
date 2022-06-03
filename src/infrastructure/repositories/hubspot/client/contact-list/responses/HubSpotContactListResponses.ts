import { HubSpotResponse, HubSpotError } from "../../shared/response";
import { HubSpotContactResponse } from "../../contact/responses/HubSpotContact";
import { HubSpotContactListResponse } from "./HubSpotContactList";

/* 
 POST /contacts/v1/lists
 200 List created
 400 Malformed request body
 doc: https://legacydocs.hubspot.com/docs/methods/lists/create_list
*/

interface SuccessOnCreateContactList extends HubSpotResponse {
  status: "200";
  body: HubSpotContactListResponse;
}

interface ErrorOnCreateContactList extends HubSpotResponse {
  status: "400";
  body: HubSpotError;
}

/*
 GET /contact/v1/lists/:list_id/contacts/all
 200 Succes on get contacts of contact list
 400 Contact list does not exist
 doc: https://legacydocs.hubspot.com/docs/methods/lists/get_list_contacts
*/

interface GetContactsInContactListResponse {
  contacts: HubSpotContactResponse[];
  "has-more": boolean;
  "vid-offset": number;
}

interface SuccessOnGetContactsInContactList extends HubSpotResponse {
  status: "200";
  body: GetContactsInContactListResponse;
}

interface ErrorOnGetContactsInContactList extends HubSpotResponse {
  status: "400" | "404";
  body: HubSpotError;
}

/*
 POST /contact/v1/lists/:list_id/add
 200 Sucess on add contacts in contact list
 404 If contact list does not exist
 400 If try add contacts in dynamic contact list
 doc: https://legacydocs.hubspot.com/docs/methods/lists/add_contact_to_list
*/

interface AddContactsInContactListResponse {
  updated: number[];
  discarded: number[];
  invalidVids: number[];
  invalidEmails: string[];
}

interface SuccessOnAddContactsInContactList extends HubSpotResponse {
  status: "200";
  body: AddContactsInContactListResponse;
}

interface ErrorOnAddContactsInNonExistentList extends HubSpotResponse {
  status: "404";
  body: HubSpotError;
}

interface ErrorOnAddContactsInDynamicContactList extends HubSpotResponse {
  status: "400";
  body: HubSpotError;
}

export {
  SuccessOnCreateContactList,
  ErrorOnCreateContactList,
  SuccessOnGetContactsInContactList,
  GetContactsInContactListResponse,
  ErrorOnGetContactsInContactList,
  SuccessOnAddContactsInContactList,
  AddContactsInContactListResponse,
  ErrorOnAddContactsInNonExistentList,
  ErrorOnAddContactsInDynamicContactList,
};
