import { HubSpotRequestOptionsWithAuthentication } from "../../shared/request";

interface HubSpotContactBatch {
  email: string;
  properties: [
    { property: "firstname"; value: string },
    { property: "lastname"; value: string }
  ];
}

interface HubSpotContactRequest {
  properties: [
    { property: "firstname"; value: string },
    { property: "lastname"; value: string }
  ];
}

interface RegisterContact extends HubSpotRequestOptionsWithAuthentication {
  pathParameters: { email: string };
  body: HubSpotContactRequest;
}

interface RegisterContacts extends HubSpotRequestOptionsWithAuthentication {
  body: HubSpotContactBatch[];
}

interface GetAllContacts extends HubSpotRequestOptionsWithAuthentication {
  pathParameter: {
    count: string;
    vidOffset?: string;
  };
}

export {
  HubSpotContactRequest,
  RegisterContact,
  RegisterContacts,
  HubSpotContactBatch,
  GetAllContacts,
};
