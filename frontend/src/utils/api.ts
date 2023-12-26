import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server";
import { store } from "./store";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
      async headers() {
        const token = localStorage.getItem("token");
        return {
          authorization: token ? `Bearer ${token}` : "",
        };
      },
    }),
  ],
});

export function getUserTemplates(origin: "upload" | "camera") {
  return client.user.getUserTemplates.query({ origin });
}

export function uploadUserTemplate(
  name: string,
  base64: string,
  origin: "upload" | "camera",
) {
  return client.user.uploadTemplate.mutate({
    base64,
    origin,
    name,
  });
}

export function deleteUserTemplate(id: string) {
  return client.user.deleteTemplate.mutate({ id });
}

export function getAllTemplates() {
  return client.template.all.query();
}

export function getTemplateImage(id: string) {
  return client.template.getSrc.query({ id });
}

export function getMeme(id: string) {
  return client.meme.get.query(id);
}

export function getAllMemes() {
  return client.meme.all.query();
}

export function createMeme(base64: string) {
  return client.meme.save.mutate({ base64 });
}

export function setUserVote(memeId: string, upvote?: boolean) {
  return client.meme.vote.mutate({ id: memeId, upvote });
}

export function getUserVotes() {
  return client.user.getVotes.query();
}

export async function login(username: string, password: string) {
  const response = await client.auth.login.query({ username, password });
  localStorage.setItem("token", response.token);
  store.setUser(response.user);
}

export async function googleLogin(idToken: string) {
  const response = await client.auth.googleLogin.query(idToken);
  localStorage.setItem("token", response.token);
  store.setUser(response.user);
}

export async function register(
  username: string,
  email: string,
  password: string,
) {
  const response = await client.auth.register.mutate({
    username,
    email,
    password,
  });
  localStorage.setItem("token", response.token);

  store.setUser(response.user);
}
