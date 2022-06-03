import { Router } from "express";
import { ListDomainReportController } from "../controllers/ListDomainReportController";
import { ensureHasHubApiKey } from "../middlewares/ensureHasHubApiKey";
const lists = Router();

const listDomainReportController = new ListDomainReportController();

lists.get(
  "/:listId/reports/domain",
  ensureHasHubApiKey,
  listDomainReportController.handle
);

export { lists };
