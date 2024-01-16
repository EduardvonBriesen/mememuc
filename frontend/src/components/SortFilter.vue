<script setup lang="ts">
import { ref, defineProps } from "vue";

const { sortChange, filterChange, textFilterChange } = defineProps([
  "sortChange",
  "filterChange",
  "textFilterChange",
]);

const sortOption = ref("new");
const filterOption = ref("");
const textFilter = ref("");

const applySort = () => {
  sortChange(sortOption.value);
};

const applyFilter = () => {
  filterChange(filterOption.value);
};

const applyTextFilter = () => {
  textFilterChange(textFilter.value);
};
</script>

<template>
  <div class="sort-filter">
    <label for="sort">Sort By:</label>
    <select v-model="sortOption" @change="applySort">
      <option value="new">Newest</option>
      <option value="top">Top Rated</option>
      <option value="hot">Lowest Rated</option>
    </select>

    <label for="filter">Filter Option:</label>
    <select v-model="filterOption" @change="applyFilter">
      <option value="">None</option>
      <!-- <option value="title">Title</option>
      <option value="description">Description</option> -->
      <option value="upvotes">Upvotes</option>
      <option value="downvotes">Downvotes</option>
      <!-- <option value="timestamp">Timestamp</option> -->
    </select>

    <label for="textFilter">Filter Value:</label>
    <input type="text" v-model="textFilter" @input="applyTextFilter" />
  </div>
</template>

<style scoped>
.sort-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
