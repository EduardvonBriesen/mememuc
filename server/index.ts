import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { generateOpenApiDocument } from "trpc-openapi";
import http from "http";
import { createOpenApiHttpHandler } from "trpc-openapi";

import { router } from "./src/trpc";
import cors from "cors";
import { createContext } from "./src/context";

import { authRouter } from "./src/routers/auth";
import { memeRouter } from "./src/routers/meme";
import { userRouter } from "./src/routers/user";
import { templateRouter } from "./src/routers/template";

const appRouter = router({
  auth: authRouter,
  meme: memeRouter,
  template: templateRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  middleware: cors({
    origin: "*",
  }),
  router: appRouter,
  createContext,
});

server.listen(3000);

const openapiServer = http.createServer(
  createOpenApiHttpHandler({ router: appRouter, createContext }),
);

openapiServer.listen(3001);
