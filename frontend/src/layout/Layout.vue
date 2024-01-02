<script setup lang="ts">
import router from "@/router";
import { store } from "@/utils/store";

function logout() {
  localStorage.removeItem("token");
  store.setUser(null);
  router.push("/");
}
</script>

<template>
  <div class="navbar bg-base-100 p-8">
    <div class="navbar-start flex gap-4">
      <img
        src="/logo.svg"
        alt="logo"
        class="h-20 cursor-pointer"
        @click="$router.push('/')"
      />
    </div>
    <div v-if="!store.user" class="navbar-end flex gap-4">
      <router-link to="/login" class="btn btn-primary"> Login </router-link>
      <router-link to="/register" class="btn btn-primary btn-outline">
        Sign up
      </router-link>
    </div>
    <div v-if="store.user" class="navbar-end flex gap-4">
      <router-link to="/editor" class="btn btn-primary">
        Generate Meme
      </router-link>

      <div class="dropdown dropdown-end">
        <div
          tabindex="0"
          role="button"
          class="btn btn-ghost btn-circle avatar placeholder"
        >
          <div class="bg-neutral text-neutral-content w-12 rounded-full">
            <span>
              {{ store.user?.username[0].toUpperCase() }}
            </span>
          </div>
        </div>
        <ul
          tabindex="0"
          class="menu menu-sm dropdown-content bg-neutral rounded-box z-[1] mt-3 w-32 p-2 shadow"
        >
          <li><router-link to="/drafts">Drafts</router-link></li>
          <li><button @click="logout">Logout</button></li>
        </ul>
      </div>
    </div>
  </div>
  <slot></slot>
</template>
