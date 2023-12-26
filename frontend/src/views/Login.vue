<script setup lang="ts">
import { googleSdkLoaded } from "vue3-google-login";
import router from "@/router";
import { googleLogin, login } from "@/utils/api";
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

function googleAuth() {
  googleSdkLoaded((google) => {
    google.accounts.oauth2
      .initCodeClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: "email profile openid",
        redirect_uri: "http://localhost:5173",
        callback: (response) => {
          if (response.code) {
            googleLogin(response.code).then(() => {
              router.push("/");
            });
          }
        },
      })
      .requestCode();
  });
}
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4 p-16">
    <div class="prose">
      <h1>Login</h1>
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
        <div class="divider divider-neutral">OR</div>
        <button class="btn btn-outline w-1/2" @click.prevent="googleAuth">
          <img
            class="h-6 w-6"
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            loading="lazy"
            alt="google logo"
          />
          <span>Login with Google</span>
        </button>
      </form>
    </div>
  </div>
</template>
