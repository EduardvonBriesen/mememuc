<script setup lang="ts">
import { login } from "@/utils/api";
import { ref } from "vue";

const username = ref("");
const password = ref("");

const onSubmit = async (event: any) => {
  event.preventDefault();

  try {
    const response = await login(username.value, password.value);

    console.log("Login successful");
    console.log(response);

    // Hier können Sie den Benutzer nach dem erfolgreichen Login weiterleiten
    // (z.B., indem Sie Vue Router verwenden).
  } catch (error) {
    console.log("Login failed");
    console.log(error);

    // Hier können Sie eine Fehlermeldung für den Benutzer anzeigen.
  }
};
</script>

<template>
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

      <button type="submit" class="btn btn-dark btn-lg btn-block">Login</button>
    </form>
  </div>
</template>
