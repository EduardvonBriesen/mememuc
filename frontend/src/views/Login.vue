<script setup lang="ts">
import router from "@/router";
import { login } from "@/utils/api";
import { ref } from "vue";

const username = ref("");
const password = ref("");
const errorMessage = ref();

const onSubmit = async (event: any) => {
  event.preventDefault();

  await login(username.value, password.value)
    .then(() => {
      router.push("/");
    })
    .catch((error) => {
      console.log("Login Error: ", error);
      errorMessage.value = "Invalid username or password.";
    });
};
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4 p-16">
    <div class="prose">
      <h1>Login to your Account</h1>
    </div>
    <div>
      <form @submit="onSubmit" class="flex w-96 flex-col items-center gap-4">
        <input
          v-model="username"
          required
          type="text"
          id="username"
          placeholder="Username"
          class="input input-bordered w-full"
          :class="{ 'input-error': errorMessage }"
        />

        <input
          v-model="password"
          required
          type="password"
          id="password"
          placeholder="Password"
          class="input input-bordered w-full"
          :class="{ 'input-error': errorMessage }"
        />

        <div class="text-error" v-if="errorMessage">{{ errorMessage }}</div>

        <button type="submit" class="btn btn-primary w-1/2">Log In</button>
      </form>
    </div>
  </div>
</template>
