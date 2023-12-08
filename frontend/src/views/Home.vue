<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getAllMemes } from "@/utils/api";

const memes = ref<
  {
    id: string;
    timestamp: string;
    base64: string;
    user: string;
  }[]
>();

onMounted(async () => {
  getAllMemes().then((data) => {
    memes.value = data;
  });
});
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4 p-16">
    <div class="prose">
      <h1>Meme Muc</h1>
      <p>
        This is a meme generator for the Online Multimedia lecture at LMU
        Munich.
      </p>
    </div>
    <router-link to="editor" class="btn btn-primary">Generate Meme</router-link>
    <router-link to="register" class="btn btn-primary"
      >Register new Account</router-link
    >
    <router-link to="login" class="btn btn-primary">Login</router-link>
    <div class="flex flex-col gap-4">
      <h2>Recent Memes</h2>
      <div class="flex flex-col gap-4">
        <div
          v-for="meme in memes"
          :key="meme.id"
          class="flex flex-col items-center gap-4"
        >
          <img :src="meme.base64" />
          <p>Created by {{ meme.user }} at {{ meme.timestamp }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
