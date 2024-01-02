<script setup lang="ts">
import { getAllDrafts } from "@/utils/api";
import { Ref, onMounted, ref } from "vue";

const drafts: Ref<
  {
    id: string;
    name: string;
    timestamp: string;
  }[]
> = ref([]);

onMounted(() => {
  getAllDrafts().then((data) => {
    drafts.value = data;
  });
});
</script>

<template>
  <div v-for="draft in drafts" :key="draft.id" class="card bg-base-100">
    <div class="card-body">
      <div class="flex flex-row justify-between">
        <div class="flex flex-col">
          <span class="text-lg font-bold">{{ draft.name }}</span>
          <span class="text-neutral-content text-sm">
            {{ draft.timestamp }}
          </span>
        </div>
        <div class="flex flex-row gap-2">
          <button
            @click="() => $router.push(`/editor/${draft.id}`)"
            class="btn btn-primary"
          >
            Edit
          </button>
          <button class="btn btn-primary btn-outline">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
getAllDraftsgetAllDrafts
