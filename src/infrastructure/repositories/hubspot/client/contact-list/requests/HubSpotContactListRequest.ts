import { HubSpotRequestOptionsWithAuthentication } from "../../shared/request";

interface HubSpotContactList {
  name: string;
  dynamic: boolean;
}

interface RegisterContactList extends HubSpotRequestOptionsWithAuthentication {
  body: HubSpotContactList;
}

interface GetContactListById extends HubSpotRequestOptionsWithAuthentication {
  pathParameters: {
    listId: string;
    vidOffset?: string;
    count: string;
  };
}

interface RegisterContactsInContactList
  extends HubSpotRequestOptionsWithAuthentication {
  pathParameters: {
    listId: string;
  };
  body: {
    vids: number[];
    emails: string[];
  };
}

export {
  RegisterContactList,
  GetContactListById,
  RegisterContactsInContactList,
};
