import { PrismaClient, Prisma } from "@prisma/client";
import express from "express";
import cors from "cors";
import router from "./router/Router";
import WatchRequests from "./classes/WatchRequests";

const server = express();

// Configurando body parser
server.use(express.urlencoded({ extended: false }));
server.use(express.json());
server.use(cors());

// Configruando o prisma
export const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation
> = new PrismaClient();

// Configurando rotas
server.use("/", router);

const watchRequests = new WatchRequests();
watchRequests.init();

// Iniciando o servidor
server.listen(3000, () => {
  console.log("Servidor rodando na porta 3000...");
});
