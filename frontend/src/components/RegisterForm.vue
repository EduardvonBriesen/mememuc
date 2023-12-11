<script setup lang="ts">
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
  try {
    if (password.value !== passwordConfirmation.value) {
      passwordError.value = "Passwords do not match.";
      return;
    }

    const response = await register(
      username.value,
      email.value,
      password.value,
    );

    console.log("Antwort Backend: ", response);
    errorMessage.value = "";

    window.location.href = "http://localhost:5173";
  } catch (error: any) {
    console.log("Fehlermeldung: ", error);

    if (error.response && error.response.status === 400) {
      console.log("Ist schon vorhanden");
      errorMessage.value =
        "An account with the username or e-mail is already registered. Please use a different username or e-mail.";
      console.log(errorMessage.value);
    }
  }
};
</script>

<template>
  <div>
    <form @submit="submitForm">
      <div class="form-group">
        <label>Username</label>
        <input v-model="username" type="text" id="username" />
      </div>

      <div class="form-group">
        <label>E-mail</label>
        <input v-model="email" type="email" id="email" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" id="password" />
      </div>
      <div class="form-group">
        <label>Password Confirmation</label>
        <input
          v-model="passwordConfirmation"
          type="password"
          id="passwordConfirmation"
        />
      </div>

      <p v-if="errorMessage" class="text-error mt-4">
        {{ errorMessage }}
      </p>
      <p v-if="passwordError" class="text-error">{{ passwordError }}</p>
      <button type="submit" class="btn btn-dark btn-lg btn-block">
        Sign Up
      </button>
    </form>
  </div>
</template>
