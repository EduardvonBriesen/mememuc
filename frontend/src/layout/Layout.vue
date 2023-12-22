<script setup lang="ts">
import { store } from "@/utils/store";

function logout() {
  localStorage.removeItem("token");
  store.setUser(null);
}
</script>

<template>
  <div class="navbar bg-base-100">
    <div class="navbar-start flex gap-4">
      <span class="prose"><h1>Meme Muc</h1></span>
    </div>
    <div v-if="!store.user" class="navbar-end flex gap-4">
      <router-link to="login" class="btn btn-primary"> Login </router-link>
      <router-link to="register" class="btn btn-primary btn-outline">
        Sign up
      </router-link>
    </div>
    <div v-if="store.user" class="navbar-end flex gap-4">
      <router-link to="editor" class="btn btn-primary">
        Generate Meme
      </router-link>
      <button class="btn btn-primary btn-outline" @click="logout">
        Logout
      </button>
    </div>
  </div>
  <slot></slot>
</template>
