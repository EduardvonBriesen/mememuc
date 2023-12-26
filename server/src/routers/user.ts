import { z } from "zod";
import { ObjectId } from "bson";
import { privatProcedure, publicProcedure, router } from "../trpc";

export const userRouter = router({
  all: publicProcedure.query(({ ctx }) => {
    const users = ctx.prisma.user.findMany().then((users) => users);
    return users;
  }),
  getUserByName: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user
        .findFirst({
          where: { username: input.username },
        })
        .then((user) => user);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }),
  getUserTemplates: privatProcedure
    .input(
      z.object({
        origin: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user
        .findFirst({
          where: { id: ctx.userId },
        })
        .then((user) => user);

      if (!user) {
        throw new Error("User not found");
      }

      const templates = user.templates.filter((template) => {
        return input.origin ? template.origin === input.origin : true;
      });

      return templates;
    }),
  uploadTemplate: privatProcedure
    .input(
      z.object({
        origin: z.string(),
        name: z.string(),
        base64: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user
        .findFirst({
          where: { id: ctx.userId },
        })
        .then((user) => user);

      if (!user) {
        throw new Error("User not found");
      }

      const id = new ObjectId().toHexString();

      await ctx.prisma.user
        .update({
          where: { id: user.id },
          data: {
            templates: {
              push: {
                id,
                name: input.name,
                origin: input.origin,
                base64: input.base64,
              },
            },
          },
        })
        .catch((err) => {
          console.log("uploadTemplate", err);
        });

      return id;
    }),
  deleteTemplate: privatProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user
        .findFirst({
          where: { id: ctx.userId },
        })
        .then((user) => user);

      if (!user) {
        throw new Error("User not found");
      }

      const index = user.templates.findIndex(
        (t) => t.id.toString() === input.id,
      );
      if (index === -1) {
        throw new Error("Template not found");
      }

      user.templates.splice(index, 1);

      await ctx.prisma.user
        .update({
          where: { id: user.id },
          data: {
            templates: user.templates,
          },
        })
        .catch((err) => {
          console.log("deleteTemplate", err);
        });

      return;
    }),
  getVotes: privatProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user
      .findFirst({
        where: { id: ctx.userId },
      })
      .then((user) => user);

    if (!user) {
      throw new Error("User not found");
    }

    return user.votes;
  }),
});
