import { TRPCError, initTRPC } from "@trpc/server";
import { createContext } from "./context";
import { verifyToken } from "./utils/jwt";

const t = initTRPC
  .context<Awaited<ReturnType<typeof createContext>>>()
  .create();

const isAuthed = t.middleware(async ({ ctx, next }) => {
  const token = ctx.req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to do that",
    });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You're token is invalid. Try logging in again",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: payload.id as string,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privatProcedure = t.procedure.use(isAuthed);
