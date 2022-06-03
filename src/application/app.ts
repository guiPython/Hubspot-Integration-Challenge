import express, { Request, Response } from "express";
import { lists } from "./routes/ListRoutes";
import { ensureHasHubApiKey } from "./middlewares/ensureHasHubApiKey";
import { errorHandler } from "./middlewares/errorsHandler";
import { rateLimit } from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 100,
  standardHeaders: true,
  keyGenerator(req: Request): string {
    return req.hubSpotApiKey;
  },
  handler(_, res: Response): void {
    res.status(429).send({
      status: "error",
      message: "Too many requests to api with same HubSpot keys",
    });
  },
});

const app = express();
app.use(express.json());
app.use(ensureHasHubApiKey);
app.use(rateLimiter);
app.use(errorHandler);

app.use("/lists", lists);

export { app };
