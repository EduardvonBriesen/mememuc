import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:4000",
    }),
  ],
});

export function getUserTemplates(user: string, origin?: "upload" | "camera") {
  return client.user.getUserTemplates.query({ username: user, origin });
}

export function uploadUserTemplate(
  user: string,
  name: string,
  base64: string,
  origin: "upload" | "camera",
) {
  return client.user.uploadTemplate.mutate({
    username: user,
    origin,
    name,
    base64,
  });
}

export function deleteUserTemplate(user: string, id: string) {
  return client.user.deleteTemplate.mutate({ username: user, id });
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

export function createMeme(username: string, base64: string) {
  return client.meme.save.mutate({ username, base64 });
}

export function login(username: string, password: string) {
  return client.auth.login.query({ username, password });
}

export function register(username: string, email: string, password: string) {
  return client.auth.register.mutate({ username, email, password });
}
