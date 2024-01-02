<script setup lang="ts">
const props = defineProps({
  word: {
    type: String,
    required: true,
  },
});

const red = "#EF476F";
const yellow = "#FFD166";
const green = "#06D6A0";
const blue = "#118AB2";
</script>

<template>
  <span class="inline-block cursor-default font-serif text-6xl">
    <span
      v-for="(letter, index) in props.word"
      :key="index"
      :style="{
        color:
          index % 4 === 0
            ? red
            : index % 4 === 1
              ? yellow
              : index % 4 === 2
                ? green
                : blue,
      }"
    >
      {{ letter }}
    </span>
  </span>
</template>
