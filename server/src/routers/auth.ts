import { z } from "zod";
import bcrypt from "bcrypt";
import axios from "axios";
import { publicProcedure, router } from "../trpc";
import { createToken } from "../utils/jwt";

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          username: input.username,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const passwordMatch = await bcrypt.compare(
        input.password,
        user.password || "",
      );
      if (!passwordMatch) throw new Error("Invalid username or password");

      const token = await createToken(user.id);
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      };
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
      const users = ctx.prisma.user;
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

      const token = await createToken(user.id);
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      };
    }),
  googleLogin: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // validate token
      const response = await axios.post("https://oauth2.googleapis.com/token", {
        code: input,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_KEY,
        redirect_uri: "postmessage",
        grant_type: "authorization_code",
      });

      const accessToken = response?.data.access_token;

      // get user details
      const userResponse = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const userDetails = userResponse.data;

      // check if user exists
      let user = await ctx.prisma.user.findFirst({
        where: {
          email: userDetails.email,
        },
      });

      if (!user) {
        // create user
        user = await ctx.prisma.user.create({
          data: {
            username: userDetails.name,
            email: userDetails.email,
          },
        });
      }

      const token = await createToken(user.id);
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      };
    }),
});
