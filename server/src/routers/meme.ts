import { z } from "zod";
import { privatProcedure, publicProcedure, router } from "../trpc";

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
  save: privatProcedure
    .input(
      z.object({
        base64: z.string(),
        title: z.string(), // Add title property here
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meme = await ctx.prisma.meme.create({
        data: {
          user: {
            connect: {
              id: ctx.userId,
            },
          },
          base64: input.base64,
          title: input.title, // Set title here
        },
      });

      return meme;
    }),
  vote: privatProcedure
    .input(
      z.object({
        id: z.string(),
        upvote: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.userId,
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
  comment: privatProcedure
    .input(
      z.object({
        memeId: z.string(),
        comment: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.create({
        data: {
          user: {
            connect: {
              id: ctx.userId,
            },
          },
          meme: {
            connect: {
              id: input.memeId,
            },
          },
          text: input.comment,
        },
      });

      return comment;
    }),
  getComments: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const comments = await ctx.prisma.comment.findMany({
        where: {
          memeId: input,
        },
      });

      const users = await ctx.prisma.user
        .findMany({
          where: {
            id: {
              in: comments.map((comment) => comment.userId),
            },
          },
        })
        .then((users) =>
          users.map((user) => ({
            id: user.id,
            username: user.username,
          })),
        );

      const usersMap = new Map(users.map((user) => [user.id, user]));

      const commentsWithUsers = comments.map((comment) => ({
        ...comment,
        username: usersMap.get(comment.userId)?.username ?? "Unknown",
      }));

      return commentsWithUsers;
    }),
});
