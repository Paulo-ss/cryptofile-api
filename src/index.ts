import { PrismaClient, Prisma } from "@prisma/client";
import express from "express";
import router from "./router/Router";

const server = express();

// Configurando body parseer
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

// Configruando o prisma
export const prisma: PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation
> = new PrismaClient();

// Configurando rotas
server.use("/", router);

// Iniciando o servidor
server.listen(3000, () => {
  console.log("Servidor rodando na porta 3000...");
});
