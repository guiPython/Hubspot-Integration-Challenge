import { Request, Response, NextFunction } from "express";

async function errorHandler(
  err: Error,
  _: Request,
  response: Response,
  next: NextFunction
) {
  return response.status(500).json({
    status: "error",
    message: `Internal server error ${err.message}`,
  });
}

export { errorHandler };
