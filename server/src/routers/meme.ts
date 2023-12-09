import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const memeRouter = router({
  get: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const meme = await ctx.prisma.meme.findUnique({
      where: {
        id: input,
      },
    });

    return meme;
  }),
  all: publicProcedure.query(async ({ ctx }) => {
    const memes = await ctx.prisma.meme.findMany();
    return memes;
  }),
  save: publicProcedure
    .input(
      z.object({
        username: z.string(),
        base64: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: handle user through auth
      const userId = await ctx.prisma.user
        .findFirst({
          where: { username: input.username },
        })
        .then((user) => user?.id)
        .catch((e) => {
          console.log(e);
          throw e;
        });

      const meme = await ctx.prisma.meme
        .create({
          data: {
            user: {
              connect: {
                id: userId,
              },
            },
            base64: input.base64,
          },
        })
        .catch((e) => {
          console.log(e);
          throw e;
        });

      return meme;
    }),
  vote: publicProcedure
    .input(
      z.object({
        id: z.string(),
        user: z.string(),
        upvote: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          username: input.user,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const vote = user.votes.find((vote) => vote.memeId === input.id);

      let upvoteChange = 0;
      let downvoteChange = 0;

      if (input.upvote === undefined) {
        // If upvote is undefined, delete the vote
        await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            votes: {
              set: user.votes.filter((vote) => vote.memeId !== input.id),
            },
          },
        });
        if (vote) {
          upvoteChange = vote.upvote ? -1 : 0;
          downvoteChange = vote.upvote ? 0 : -1;
        }
      } else if (vote) {
        // If upvote is defined, update the vote
        await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            votes: {
              set: user.votes.map((vote) => {
                if (vote.memeId === input.id) {
                  return {
                    ...vote,
                    upvote: input.upvote ?? vote.upvote,
                  };
                }
                return vote;
              }),
            },
          },
        });

        if (vote.upvote !== input.upvote) {
          upvoteChange = input.upvote ? 1 : -1;
          downvoteChange = input.upvote ? -1 : 1;
        }
      } else {
        // If upvote is defined, create the vote
        await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            votes: {
              push: {
                memeId: input.id,
                upvote: input.upvote,
              },
            },
          },
        });

        upvoteChange = input.upvote ? 1 : 0;
        downvoteChange = input.upvote ? 0 : 1;
      }

      const meme = await ctx.prisma.meme.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!meme) {
        throw new Error("Meme not found");
      }

      const upvotes = meme.upvotes + upvoteChange;
      const downvotes = meme.downvotes + downvoteChange;

      await ctx.prisma.meme.update({
        where: {
          id: input.id,
        },
        data: {
          upvotes,
          downvotes,
        },
      });
    }),
});
