import { Request, Response } from "express";
import { ImportContactsFromContactListError } from "../../domain/usecases/queries/ImportContactsFromContactList";
import { importContactsFromContactListInHubSpot } from "../../domain/usecases/queries/ImportContactsFromContactList";

interface IDomainReport {
  domain: string;
  quantity: number;
}

class ListDomainReportController {
  async handle(
    request: Request,
    response: Response
  ): Promise<Response<IDomainReport[]>> {
    try {
      const listId = request.params.listId;
      if (listId === "" || !Number.isInteger(Number(listId)))
        return response.status(400).send({
          status: "error",
          message: "Invalid list id",
        });

      const contacts = await importContactsFromContactListInHubSpot(
        request.hubSpotApiKey
      ).execute(Number(listId));

      const report: IDomainReport[] = [];
      contacts.forEach((c) => {
        const domainReportIndex = report.findIndex(
          (dR) => dR.domain === c.emailDomain
        );

        if (domainReportIndex === -1)
          report.push({ domain: c.emailDomain, quantity: 1 });
        else {
          let domainReport = report[domainReportIndex];
          domainReport.quantity++;
          report[domainReportIndex] = domainReport;
        }
      });

      return response.status(200).send(report);
    } catch (error) {
      if (error instanceof ImportContactsFromContactListError)
        return response
          .status(502)
          .send({ status: "error", message: error.message });
      throw error;
    }
  }
}

export { ListDomainReportController };
