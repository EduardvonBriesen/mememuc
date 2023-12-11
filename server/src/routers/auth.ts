import { z } from "zod";
import bcrypt from "bcrypt";
import { publicProcedure, router } from "../trpc";

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.users.findFirst({
        where: {
          username: input.username,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const passwordMatch = await bcrypt.compare(input.password, user.password);

      if (passwordMatch) {
        return user;
      } else {
        throw new Error("Invalid username or password");
      }
    }),
  register: publicProcedure
    .input(
      z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const users = ctx.prisma.users;
      const existingUser = await users.findFirst({
        where: {
          OR: [{ username: input.username }, { email: input.email }],
        },
      });

      if (existingUser) {
        throw new Error("Username or email already exists");
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await users.create({
        data: {
          username: input.username,
          email: input.email,
          password: hashedPassword,
        },
      });

      return user;
    }),
});
