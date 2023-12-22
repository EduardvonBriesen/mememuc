<script setup lang="ts">
import { store } from "@/utils/store";

console.log(store);
</script>

<template>
  <div class="navbar bg-base-100">
    <div class="navbar-start flex gap-4">
      <span class="prose"><h1>Meme Muc</h1></span>
    </div>
    <div class="navbar-end flex gap-4">
      <router-link v-if="!store.user" to="login" class="btn btn-primary">
        Login
      </router-link>
      <router-link
        v-if="!store.user"
        to="register"
        class="btn btn-primary btn-outline"
      >
        Sign up
      </router-link>
      <router-link v-if="store.user" to="editor" class="btn btn-primary">
        Generate Meme
      </router-link>
    </div>
  </div>
  <slot></slot>
</template>
