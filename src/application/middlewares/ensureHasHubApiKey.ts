import { Request, Response, NextFunction } from "express";

async function ensureHasHubApiKey(
  request: Request,
  _: Response,
  next: NextFunction
) {
  if (!request.body.hapiKey) {
    let hubSpotApiKey = process.env.HUBSPOT_API_KEY;
    if (hubSpotApiKey === "" || hubSpotApiKey === " ")
      throw Error("Missing HubSpotKey");
    else request.hubSpotApiKey = hubSpotApiKey;
  } else {
    request.hubSpotApiKey = request.body.hapiKey;
  }

  next();
}

export { ensureHasHubApiKey };
