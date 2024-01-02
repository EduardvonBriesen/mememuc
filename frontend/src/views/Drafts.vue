<script setup lang="ts">
import { deleteDraft, getAllDrafts } from "@/utils/api";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/solid";
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

function deleteDraftHandler(id: string) {
  const confirmation = window.confirm(
    "Are you sure you want to delete this draft?",
  );
  if (!confirmation) return;

  console.log("delete draft", confirmation);
  deleteDraft(id);

  drafts.value = drafts.value.filter((draft) => draft.id !== id);
}
</script>

<template>
  <div class="flex justify-center">
    <table class="bg-default table max-w-screen-sm">
      <thead>
        <tr>
          <th>Name</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="draft in drafts" :key="draft.id" class="hover">
          <td>{{ draft.name }}</td>
          <td>{{ new Date(draft.timestamp).toLocaleString() }}</td>
          <td class="flex gap-4">
            <button
              @click="() => $router.push(`/editor/${draft.id}`)"
              class="btn btn-primary btn-ghost btn-circle"
            >
              <PencilIcon class="h-6 w-6" />
            </button>
            <button
              class="btn btn-error btn-outline btn-circle"
              @click="() => deleteDraftHandler(draft.id)"
            >
              <TrashIcon class="h-6 w-6" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
