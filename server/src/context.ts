import { PrismaClient } from ".prisma/client";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";

export function createContext({ req, res }: CreateHTTPContextOptions) {
  const prisma = new PrismaClient();

  return { prisma, req, res };
}
