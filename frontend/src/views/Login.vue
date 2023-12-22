<script setup lang="ts">
import router from "@/router";
import { login } from "@/utils/api";
import { ref } from "vue";

const username = ref("");
const password = ref("");

const onSubmit = async (event: any) => {
  event.preventDefault();

  await login(username.value, password.value)
    .then(() => {
      router.push("/");
    })
    .catch((error) => {
      console.log("Fehlermeldung: ", error);
    });
};
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4 p-16">
    <div class="prose">
      <h1>Login to your Account</h1>
    </div>
    <div>
      <form @submit="onSubmit">
        <div class="form-group">
          <label>Username</label>
          <input v-model="username" type="text" id="username" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" id="password" />
        </div>

        <button type="submit" class="btn btn-dark btn-lg btn-block">
          Login
        </button>
      </form>
    </div>
  </div>
</template>
