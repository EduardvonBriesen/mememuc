import Home from "@/views/Home.vue";
import Editor from "@/views/Editor.vue";
import Register from "@/views/Register.vue";
import Login from "@/views/Login.vue";
import Memes from "@/views/Memes.vue";
import { createRouter, createWebHistory } from "vue-router";
import { store } from "@/utils/store";

const routes = [
  { path: "/", component: Home },
  { path: "/editor", component: Editor },
  { path: "/register", component: Register },
  { path: "/login", component: Login },
  // { path: "/memes", component: Memes },
  { path: "/meme/:memeId", component: Memes },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (to.path === "/editor" && !store.user) {
    return "/login";
  }
});

export default router;
