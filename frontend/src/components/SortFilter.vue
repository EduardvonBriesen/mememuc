<script setup lang="ts">
import { ref, defineProps } from "vue";
import DatePicker from "@/components/DatePicker.vue";

const date = ref(new Date());

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

  console.log(filterOption.value);

  if (["upvotes", "downvotes"].includes(filterOption.value)) {
    inputFilterChange({
      textFilter: textFilter.value,
      comparisonOperator: comparisonOperator.value,
      numericalValue: parseInt(numericalValue.value),
      dateValue: "",
    });
  } else if (["before", "after"].includes(filterOption.value)) {
    inputFilterChange({
      textFilter: textFilter.value,
      comparisonOperator: "",
      numericalValue: 0,
      dateValue: dateToTimestamp(date.value),
    });
  } else {
    inputFilterChange({
      textFilter: textFilter.value,
      comparisonOperator: "",
      numericalValue: 0,
      dateValue: "",
    });
  }
};

const updateNumericalFilter = () => {
  if (["upvotes", "downvotes"].includes(filterOption.value)) {
    applyFilter();
  }
};

const dateToTimestamp = (date: Date) => {
  // Set hours, minutes, seconds, and milliseconds to 0
  date.setUTCHours(0, 0, 0, 0);

  // Convert to ISO string
  const formattedTimestamp = date.toISOString();

  console.log(formattedTimestamp);

  return formattedTimestamp;
};
</script>

<template>
  <div class="sort-filter">
    <label for="sort">Sort By:</label>
    <select
      v-model="sortOption"
      @change="applySort"
      class="select select-primary border-primary"
    >
      <option value="new">Newest</option>
      <option value="old">Oldest</option>
      <option value="top">Top Rated</option>
      <option value="hot">Worst Rated</option>
    </select>

    <label for="filter">Filter Option:</label>
    <select
      v-model="filterOption"
      @change="applyFilter"
      class="select select-primary border-primary"
    >
      <option value="">None</option>
      <option value="upvotes">Upvotes</option>
      <option value="downvotes">Downvotes</option>
      <option value="before">Date Before</option>
      <option value="after">Date After</option>
      <!-- <option value="timestamp">Timestamp</option> -->
    </select>

    <template v-if="['upvotes', 'downvotes'].includes(filterOption)">
      <label for="comparisonOperator">Operator:</label>
      <select
        v-model="comparisonOperator"
        @change="applyFilter"
        class="select select-primary border-primary"
      >
        <option value="=">Equal to</option>
        <option value=">">Greater than</option>
        <option value="<">Less than</option>
      </select>

      <label for="numericalValue">Value:</label>
      <input
        type="number"
        v-model="numericalValue"
        @input="updateNumericalFilter"
        class="input input-bordered border-primary"
      />
    </template>

    <template v-if="['before', 'after'].includes(filterOption)">
      <DatePicker
        v-model="date"
        :enable-time-picker="false"
        @input="applyFilter"
        dark
        input-class-name="input input-bordered border-primary"
      />
    </template>

    <label for="textFilter">Search:</label>
    <input
      type="text"
      v-model="textFilter"
      @input="applyFilter"
      class="input input-bordered border-primary"
    />
  </div>
</template>

<style scoped>
.sort-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
