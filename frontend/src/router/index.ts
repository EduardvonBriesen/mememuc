import Home from "@/views/Home.vue";
import Editor from "@/views/Editor.vue";
import Memes from "@/views/Memes.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: Home },
  { path: "/editor", component: Editor },
  // { path: "/memes", component: Memes },
  { path: "/memes/:memeId", component: Memes },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
