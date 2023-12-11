import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const memeRouter = router({
  get: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const meme = await ctx.prisma.memes.findUnique({
      where: {
        id: input,
      },
    });

    return meme;
  }),
  save: publicProcedure
    .input(
      z.object({
        username: z.string(),
        base64: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meme = await ctx.prisma.memes.create({
        data: {
          user: input.username,
          base64: input.base64,
        },
      });

      return meme;
    }),
});
