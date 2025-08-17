import express from "express";
import consola, { ConsolaInstance } from "consola";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

export class Server {
  public app: express.Application;
  public logger: ConsolaInstance = consola;
  private prisma: PrismaClient = new PrismaClient();

  public constructor() {
    this.app = express();
  }

  public start() {
    this.setConfig();
    this.setRequestLogger();
    this.setRouters();

    this.app.listen(process.env.PORT, () => {
      this.logger.success(`Server started at port - ${process.env.PORT}`);
    });
  }

  private setConfig() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(cors());
    dotenv.config();
  }

  private setRequestLogger() {
    this.app.use(async (req, res, next) => {
      console.log(`[${req.method}] - ${req.path}`);
      next();
    });
  }

  private setRouters() {
    this.app.get("/", (req, res) => {
      res.json({ success: true, message: "JWT authentication" });
    });
  }

  public async sendQuery(): Promise<void> {
    const result = await this.prisma.test.create({
      data: {
        id: 1,
        key: "value1",
        key2: "value2",
      },
    });

    console.log("Query result: " + result);
  }
}
