<script setup lang="ts">
import { onMounted, ref } from "vue";
import { PlusCircleIcon } from "@heroicons/vue/24/solid";
import { getMemes } from "@/utils/api";
import PlayfulText from "@/components/PlayfulText.vue";
import MemeCard from "@/components/MemeCard.vue";

const memes = ref<
  {
    id: string;
    user: string;
    link: string;
    description: string;
    base64: string;
    title: string;
    timestamp: string;
    upvotes: number;
    downvotes: number;
    usertexts: string;
    template: string;
  }[]
>();

const page = ref(1);
const endOfPage = ref(false);

const isOffline = ref(false);

onMounted(async () => {
  getMemes({ sort: "new", image: true })
    .then((data) => {
      memes.value = data;
    })
    .catch((error) => {
      console.error(error);
      console.log("Loading memes from local storage");
      memes.value = JSON.parse(localStorage.getItem("memes") || "[]");
      isOffline.value = true;
    });
});

function loadMore() {
  page.value++;
  getMemes({ sort: "new", image: true, page: page.value }).then((data) => {
    console.log(data);
    memes.value = [...memes.value, ...data];

    if (data.length === 0) {
      endOfPage.value = true;
    }
  });
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <PlayfulText word="Memes" />
    <div role="alert" class="alert alert-error max-w-md" v-if="isOffline">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        You are currently offline. The memes are loaded from the local storage.
      </span>
    </div>
    <MemeCard v-for="meme in memes" :key="meme.id" :meme="meme" />
    <button @click="loadMore" class="btn btn-primary m-4" v-if="!endOfPage">
      <PlusCircleIcon class="h-5 w-5" />
      Load more
    </button>
    <p v-else class="m-4">No more memes to load</p>
  </div>
</template>
