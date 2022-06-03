import { IContactListQueriesRepository } from "../../domain/ports/repository/ContactList";
import {
  ImportContactsFromContactList,
  ImportContactsFromContactListError,
} from "../../domain/usecases/queries/ImportContactsFromContactList";
import { app } from "../app";
import request from "supertest";
import { Contact } from "../../domain/entities/Contact";

const mockContactListRepository: jest.Mocked<IContactListQueriesRepository> = {
  findContactsInListById: jest.fn(),
};

const mockImportContactsFromContactList = new ImportContactsFromContactList(
  mockContactListRepository
);

jest.mock("../../domain/usecases/queries/ImportContactsFromContactList", () => {
  const originalModule = jest.requireActual(
    "../../domain/usecases/queries/ImportContactsFromContactList"
  );
  return {
    ...originalModule,
    importContactsFromContactListInHubSpot: () =>
      mockImportContactsFromContactList,
  };
});

afterAll(() => jest.clearAllMocks());

describe("Test ListDomainReport Controller", () => {
  describe("Should be return response with status 200", () => {
    it("Return with empty domain report", async () => {
      mockContactListRepository.findContactsInListById.mockResolvedValue([]);
      await request(app)
        .get(`/lists/${1}/reports/domain`)
        .send({ hapiKey: "" })
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual([]);
        });
    });

    it("Return domain report with one domain", async () => {
      const mockContactWithEmailDomainOutlook = new Contact({
        name: "Test Outlook",
        lastname: "Test Outlook",
        email: "test@outlook.com",
      });

      const mockContactWithEmailDomainGmail = new Contact({
        name: "Test Gmail",
        lastname: "Test Gmail",
        email: "test@gmail.com",
      });

      mockContactListRepository.findContactsInListById.mockResolvedValue([
        mockContactWithEmailDomainOutlook,
        mockContactWithEmailDomainOutlook,
        mockContactWithEmailDomainGmail,
      ]);
      await request(app)
        .get(`/lists/${1}/reports/domain`)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual([
            { domain: "outlook.com", quantity: 2 },
            { domain: "gmail.com", quantity: 1 },
          ]);
        });
    });
  });

  describe("Should be return response with status 400", () => {
    it("Return with message 'Invalid list id'", async () => {
      mockContactListRepository.findContactsInListById.mockResolvedValue([]);
      await request(app)
        .get(`/lists/${"invalidListId"}/reports/domain`)
        .send({ hapiKey: "1" })
        .expect(400)
        .then((response) => {
          expect(response.body).toEqual({
            status: "error",
            message: "Invalid list id",
          });
        });
    });

    it("Return with some message", async () => {
      mockContactListRepository.findContactsInListById.mockRejectedValue(
        new ImportContactsFromContactListError("Import error", new Error())
      );
      await request(app)
        .get(`/lists/${1}/reports/domain`)
        .send({ hapiKey: "1" })
        .expect(502)
        .then((response) => {
          expect(response.body).toEqual({
            status: "error",
            message: "Import error",
          });
        });
    });
  });
});
