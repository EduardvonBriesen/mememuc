import { z } from "zod";
import { privatProcedure, publicProcedure, router } from "../trpc";
import { createCanvas, loadImage } from "canvas";

export const memeRouter = router({
  get: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const meme = await ctx.prisma.meme.findUnique({
      where: {
        id: input,
        visibility: {
          in: ["PUBLIC", "UNLISTED"],
        },
      },
    });

    return meme;
  }),
  all: publicProcedure.query(async ({ ctx }) => {
    const memes = await ctx.prisma.meme.findMany({
      where: {
        visibility: "PUBLIC",
      },
      select: {
        id: true,
      },
    });

    return memes;
  }),
  find: publicProcedure
    .meta({ openapi: { method: "GET", path: "/memes" } })
    .input(
      z.object({
        query: z.string().optional(),
        sort: z.enum(["new", "top", "hot"]).optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().default(10),
        image: z.boolean().default(false),
      }),
    )
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const memes = await ctx.prisma.meme
        .findMany({
          orderBy: [
            { timestamp: input.sort === "new" ? "desc" : undefined },
            { upvotes: input.sort === "top" ? "desc" : undefined },
            { downvotes: input.sort === "hot" ? "desc" : undefined },
          ],
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          where: {
            title: {
              contains: input.query,
            },
            visibility: "PUBLIC",
          },
          select: {
            id: true,
            title: true,
            upvotes: true,
            downvotes: true,
            timestamp: true,
            description: true,
            base64: input.image,
            user: {
              select: {
                username: true,
              },
            },
          },
        })
        .then((memes) =>
          memes.map((meme) => ({
            ...meme,
            user: meme.user.username,
            link: `http://localhost:5173/meme/${meme.id}`,
          })),
        );

      return memes;
    }),
  save: privatProcedure
    .input(
      z.object({
        base64: z.string(),
        title: z.string(), // Add title property here
        description: z.string().optional(),
        visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("PUBLIC"),
        text_1: z.string().optional(),
        text_2: z.string().optional(),
        text_3: z.string().optional(),
        text_4: z.string().optional(),
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
          description: input.description,
          visibility: input.visibility,
          text_1: input.text_1,
          text_2: input.text_2,
          text_3: input.text_3,
          text_4: input.text_4,
        },
      });

      return meme;
    }),
  create: publicProcedure
    .meta({ openapi: { method: "POST", path: "/create" } })
    .input(
      z.object({
        template: z.string(),
        memes: z
          .object({
            title: z.string(),
            texts: z
              .object({
                text: z.string(),
                x: z.number().default(0),
                y: z.number().default(0),
                size: z.number().default(20),
                color: z.string().default("#000000"),
              })
              .array(),
          })
          .array(),
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const memes = [];

      for (const meme of input.memes) {
        const image = await loadImage(input.template);
        const canvas = createCanvas(image.width, image.height);
        const canvasCtx = canvas.getContext("2d");
        canvasCtx.drawImage(image, 0, 0, image.width, image.height);

        for (const text of meme.texts) {
          canvasCtx.font = `${text.size}px sans-serif`;
          canvasCtx.fillStyle = text.color;
          canvasCtx.fillText(text.text, text.x, text.y);
        }

        const memeLink = await ctx.prisma.meme
          .create({
            data: {
              user: {
                connect: {
                  id: "655b6b0c07a007a18d5ca219", // test-user
                },
              },
              title: meme.title,
              base64: canvas.toDataURL(),
            },
          })
          .then((meme) => ({
            link: `http://localhost:5173/meme/${meme.id}`,
          }));

        memes.push(memeLink.link);
      }

      return memes;
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
