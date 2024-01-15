// SortFilter.vue
<template>
  <div class="sort-filter">
    <label for="sort">Sort By:</label>
    <select v-model="sortOption" @change="applySort">
      <option value="new">Newest</option>
      <option value="top">Top Rated</option>
      <option value="hot">Hot</option>
    </select>

    <label for="filter">Filter By:</label>
    <select v-model="filterOption" @change="applyFilter">
      <option value="">None</option>
      <option value="title">Title</option>
      <option value="upvotes">Upvotes</option>
      <option value="downvotes">Downvotes</option>
      <option value="timestamp">Timestamp</option>
      <option value="description">Description</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const sortOption = ref("new");
const filterOption = ref("");

const applySort = () => {
  // Emit an event to notify the parent component (home.vue) about the sorting option change
  emit("sort-change", sortOption.value);
};

const applyFilter = () => {
  // Emit an event to notify the parent component (home.vue) about the filtering option change
  emit("filter-change", filterOption.value);
};
</script>

<style scoped>
/* Add your styling for the SortFilter component here */
.sort-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
