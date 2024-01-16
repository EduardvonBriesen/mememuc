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
const textFilter = ref("");
const comparisonOperator = ref("=");
const numericalValue = ref(0);

const updateSort = (option: string) => {
  console.log("updateSort");
  console.log("Sort Option:", option);
  sortOption.value = option;
  console.log(sortOption.value);

  // Call the API to fetch memes with the updated sorting option
  fetchMemes();
};

const updateFilter = (option: string) => {
  console.log("updateFilterOption");
  console.log("Filter Option:", option);
  filterOption.value = option;
  console.log(filterOption.value);

  // Call the API to fetch memes with the updated filtering option
  fetchMemes();
};

const updateFilterInput = (value: any) => {
  console.log("updateFilterInput");
  console.log("Filter Input:", value);
  textFilter.value = value.textFilter;
  comparisonOperator.value = value.comparisonOperator;
  numericalValue.value = value.numericalValue;
  console.log(textFilter.value);
  console.log(comparisonOperator.value);
  console.log(numericalValue.value);

  // Call the API to fetch memes with the updated text filter
  fetchMemes();
};

// const updateNumericalFilter = (value: number) => {
//   console.log("updateNumericalFilter");
//   console.log("Numerical Filter Value:", value);
//   numericalValue.value = value;

//   // Call the API to fetch memes with the updated numerical filter
//   fetchMemes();
// };

async function fetchMemes() {
  try {
    const data = await getMemes({
      // query: textFilter.value,
      page: 1,
      limit: 10,
      sort: sortOption.value,
      image: true,
      filterOption: filterOption.value,
      comparisonOperator: comparisonOperator.value,
      numericalValue: numericalValue.value,
      textFilter: textFilter.value,
    });

    memes.value = data;
  } catch (error) {
    console.error("Error fetching memes:", error);
    // Handle the error, show an error message, or retry the request.
  }
}

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
    <SortFilter
      :sortChange="updateSort"
      :filterChange="updateFilter"
      :inputFilterChange="updateFilterInput"
    />

    <PlayfulText word="Memes" />
    <MemeCard v-for="meme in memes" :key="meme.id" :meme="meme" />
    <button @click="loadMore" class="btn btn-primary m-4" v-if="!endOfPage">
      <PlusCircleIcon class="h-5 w-5" />
      Load more
    </button>
    <p v-else class="m-4">No more memes to load</p>
  </div>
</template>
