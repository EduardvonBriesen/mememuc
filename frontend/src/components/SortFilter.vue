<script setup lang="ts">
import { ref, defineProps } from "vue";

const { sortChange, filterChange } = defineProps([
  "sortChange",
  "filterChange",
]);

const sortOption = ref("new");
const filterOption = ref("");

const applySort = () => {
  sortChange(sortOption.value);
};

const applyFilter = () => {
  filterChange(filterOption.value);
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

    <label for="filter">Filter:</label>
    <select v-model="filterOption" @change="applyFilter">
      <option value="">None</option>
      <option value="title">Title</option>
      <option value="upvotes">Upvotes</option>
      <option value="downvotes">Downvotes</option>
      <!-- <option value="timestamp">Timestamp</option> -->
      <option value="description">Description</option>
    </select>
  </div>
</template>

<style scoped>
.sort-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
