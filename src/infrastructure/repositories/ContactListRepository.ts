import { IContactListRepository } from "@domain/ports/repository/ContactList";
import { HubSpotContactListClient } from "./hubspot/client/contact-list/HubSpotContactListClient";
import { HubSpotContactListRepository } from "./hubspot/contact-list/HubSpotContactListRepository";

const createHubSpotContactListRepository = (
  hubSpotApiKey: string
): IContactListRepository => {
  const client = new HubSpotContactListClient();
  return new HubSpotContactListRepository(hubSpotApiKey, client);
};

export { createHubSpotContactListRepository };
