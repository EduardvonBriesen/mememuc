<script setup lang="ts">
import { onMounted, ref } from "vue";
import { PlusCircleIcon } from "@heroicons/vue/24/solid";
import { getMemes } from "@/utils/api";
import PlayfulText from "@/components/PlayfulText.vue";
import MemeCard from "@/components/MemeCard.vue";
import SortFilter from "@/components/SortFilter.vue";

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
  }[]
>();

const page = ref(1);
const endOfPage = ref(false);
const sortOption = ref("new");
const filterOption = ref("");

const updateSort = (option: string) => {
  sortOption.value = option;
  // Call the API or function to fetch memes with the updated sorting option
  // For example: getMemes({ sort: option, image: true }).then((data) => { memes.value = data; });
};

const updateFilter = (option: string) => {
  filterOption.value = option;
  // Call the API or function to fetch memes with the updated filtering option
  // For example: getMemes({ sort: sortOption.value, filter: option, image: true }).then((data) => { memes.value = data; });
};

onMounted(async () => {
  getMemes({ sort: "new", image: true }).then((data) => {
    memes.value = data;
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
    <SortFilter @sort-change="updateSort" @filter-change="updateFilter" />

    <PlayfulText word="Memes" />
    <MemeCard v-for="meme in memes" :key="meme.id" :meme="meme" />
    <button @click="loadMore" class="btn btn-primary m-4" v-if="!endOfPage">
      <PlusCircleIcon class="h-5 w-5" />
      Load more
    </button>
    <p v-else class="m-4">No more memes to load</p>
  </div>
</template>
