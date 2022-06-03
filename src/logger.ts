import pino from "pino";
import pretty from "pino-pretty";

const stream = pretty({
  levelFirst: true,
  translateTime: "dd/mm/yyyy HH:MM:ss TT",
  colorize: true,
});

export const logger = pino(
  {
    enabled: true,
    level: "info",
  },
  stream
);
