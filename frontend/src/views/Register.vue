<script setup lang="ts">
import router from "@/router";
import { register } from "@/utils/api";
import { ref } from "vue";

const username = ref("");
const email = ref("");
const password = ref("");
const passwordConfirmation = ref("");
const errorMessage = ref("");
const passwordError = ref("");

const submitForm = async (event: any) => {
  event.preventDefault();

  if (password.value !== passwordConfirmation.value) {
    passwordError.value = "Passwords do not match.";
    return;
  }

  await register(username.value, email.value, password.value)
    .then(() => {
      router.push("/");
    })
    .catch((error) => {
      console.log("Register Error: ", error);
      errorMessage.value = "Username or E-Mail already taken.";
    });
};
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4 p-16">
    <div class="prose">
      <h1>Create new Account</h1>
    </div>
    <form @submit="submitForm" class="flex w-96 flex-col items-center gap-4">
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
        v-model="email"
        required
        type="email"
        id="email"
        placeholder="E-Mail"
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
        :class="{ 'input-error': passwordError }"
      />

      <input
        v-model="passwordConfirmation"
        required
        type="password"
        id="passwordConfirmation"
        placeholder="Password Confirmation"
        class="input input-bordered w-full"
        :class="{ 'input-error': passwordError }"
      />

      <div class="text-error" v-if="errorMessage">
        {{ errorMessage }}
      </div>
      <div class="text-error" v-if="passwordError">
        {{ passwordError }}
      </div>
      <button type="submit" class="btn btn-primary w-1/2">Sign Up</button>
    </form>
  </div>
</template>
