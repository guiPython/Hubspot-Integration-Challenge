import csv from "csv-parser";
import { open } from "fs/promises";

class ErrorOnReadCsv extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
}

class CsvReader<Chunk, Register> {
  private initLine: number;
  private currentLine: number;
  constructor({ ignoreHeader }: { ignoreHeader?: boolean } = {}) {
    if (ignoreHeader !== null)
      ignoreHeader ? (this.initLine = 1) : (this.initLine = 0);
    else this.initLine = 0;
    this.currentLine = this.initLine;
  }


  public async read(
    path: string,
    transform: (chunk: Chunk) => Register
  ): Promise<Register[]> {
    const file = await open(path, "r").catch((err) => {
      throw new ErrorOnReadCsv(err.message);
    });

    const registers = [];
    return new Promise<Register[]>((resolve, reject) => {
      file
        .createReadStream()
        .pipe(csv())
        .on("data", async (chunk: Chunk) => {
          registers.push(transform(chunk));
        })
        .on("error", (err: Error) => {
          reject(new ErrorOnReadCsv(err.message));
        })
        .on("end", () => resolve(registers));
    });
  }

  public async shift(path: string): Promise<string> {
    const file = await open(path, "r").catch((err) => {
      throw new ErrorOnReadCsv(err.message);
    });

    return new Promise<string>((resolve, reject) => {
      let registers: string;
      file
        .createReadStream()
        .on("data", async (data) => {
          registers += data;
          const lines = registers.split("\n");

          if (lines.length >= +this.currentLine) {
            resolve(lines[+this.currentLine]);
          }
        })
        .on("error", (err: Error) => reject(new ErrorOnReadCsv(err.message)));
    });
  }
}

export { CsvReader, ErrorOnReadCsv };
