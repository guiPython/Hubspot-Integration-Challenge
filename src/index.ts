import "dotenv/config";
import { app } from "@application/app";
import {
  importAllContactsFromCsv,
  importAllContactsFromHubSpot,
} from "@domain/usecases/queries/ImportAllContacts";

import { logger } from "./logger";
import { createContactListInHubSpot } from "@domain/usecases/commands/CreateContactList";
import { createContactsInHubSpotOnStartup } from "@domain/usecases/commands/CreateContacts";
import { ContactList } from "@domain/entities/ContactList";

async function init() {
  const hubSpotApiKey = process.env.HUBSPOT_API_KEY;
  if (hubSpotApiKey === "") throw new Error("Missing HubSpot api key in .env");
  logger.info(`HubSpot api key ${hubSpotApiKey}`);

  const contactsOnCsv = await importAllContactsFromCsv(
    "Contatos.csv"
  ).execute();
  logger.info("Imported all contacts of csv");

  const contactsOnHubSpot = await importAllContactsFromHubSpot(
    hubSpotApiKey
  ).execute();
  logger.info("Imported all contacts of HubSpot");

  await createContactsInHubSpotOnStartup(
    hubSpotApiKey,
    contactsOnCsv,
    contactsOnHubSpot
  ).execute();
  logger.info("Added contacts in HubSpot");

  const response = await createContactListInHubSpot(
    hubSpotApiKey,
    ContactList.getListNameByContacts(contactsOnCsv),
    contactsOnCsv
  )
    .execute()
    .then((response) => response.value);

  if (response instanceof Error) throw response;
  logger.info(`Created contact list id: ${response.id} name: ${response.name}`);
}

async function main() {
  try {
    await init();
    const PORT = process.env.PORT ?? 3333;
    app.listen(PORT, () => logger.info(`Listen on port: ${PORT}`));
  } catch (err) {
    logger.error(err.message);
  }
}

main();
