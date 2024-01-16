<script setup lang="ts">
import { ref, defineProps } from "vue";

const { sortChange, filterChange, inputFilterChange } = defineProps([
  "sortChange",
  "filterChange",
  "inputFilterChange",
]);

const sortOption = ref("new");
const filterOption = ref("");
const textFilter = ref("");
const comparisonOperator = ref("=");
const numericalValue = ref("0");

const applySort = () => {
  sortChange(sortOption.value);
};

const applyFilter = () => {
  filterChange(filterOption.value);

  if (!["upvotes", "downvotes"].includes(filterOption.value)) {
    inputFilterChange({
      textFilter: textFilter.value,
      comparisonOperator: "",
      numericalValue: 0,
    });
  } else {
    inputFilterChange({
      textFilter: "",
      comparisonOperator: comparisonOperator.value,
      numericalValue: parseInt(numericalValue.value),
    });
  }
};

const updateNumericalFilter = () => {
  if (["upvotes", "downvotes"].includes(filterOption.value)) {
    applyFilter();
  }
};
</script>

<template>
  <div class="sort-filter">
    <label for="sort">Sort By:</label>
    <select v-model="sortOption" @change="applySort">
      <option value="new">Newest</option>
      <option value="old">Oldest</option>
      <option value="top">Top Rated</option>
      <option value="hot">Worst Rated</option>
    </select>

    <label for="filter">Filter Option:</label>
    <select v-model="filterOption" @change="applyFilter">
      <option value="">None</option>
      <option value="title">Title</option>
      <option value="description">Description</option>
      <option value="upvotes">Upvotes</option>
      <option value="downvotes">Downvotes</option>
      <!-- <option value="timestamp">Timestamp</option> -->
    </select>

    <template v-if="['upvotes', 'downvotes'].includes(filterOption)">
      <label for="comparisonOperator">Operator:</label>
      <select v-model="comparisonOperator">
        <option value="=">Equal to</option>
        <option value=">=">Greater than or equal to</option>
        <option value="<=">Less than or equal to</option>
        <option value=">">Greater than</option>
        <option value="<">Less than</option>
      </select>

      <label for="numericalValue">Value:</label>
      <input
        type="number"
        v-model="numericalValue"
        @input="updateNumericalFilter"
      />
    </template>

    <template v-if="['title', 'description'].includes(filterOption)">
      <label for="textFilter">Filter Value:</label>
      <input type="text" v-model="textFilter" @input="applyFilter" />
    </template>
  </div>
</template>

<style scoped>
.sort-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

select,
input {
  color: #000;
}
</style>
