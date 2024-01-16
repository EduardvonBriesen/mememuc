<script setup lang="ts">
import PlayfulText from "@/components/PlayfulText.vue";
import { deleteDraft, getAllDrafts, client } from "@/utils/api";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/solid";
import { Ref, onMounted, ref } from "vue";

const drafts: Ref<
  {
    id: string;
    name: string;
    timestamp: string;
  }[]
> = ref([]);

const memes: Ref<
  {
    id: string;
    description: string;
    base64: string;
    userId: string;
    title: string;
    visibility?: "PUBLIC" | "PRIVATE" | "UNLISTED";
    timestamp: string;
    upvotes: number;
    downvotes: number;
  }[]
> = ref([]);

onMounted(() => {
  getAllDrafts().then((data) => {
    drafts.value = data;
  });
  client.user.getMemes.query().then((data) => {
    memes.value = data;
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
  <div class="flex flex-col items-center justify-center">
    <PlayfulText word="Memes" />
    <table class="bg-default table max-w-screen-sm">
      <thead>
        <tr>
          <th>Preview</th>
          <th>Title</th>
          <th>Created</th>
          <th>Visibility</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="meme in memes" :key="meme.id" class="hover">
          <td>
            <img
              :src="meme.base64"
              class="h-16 w-16"
              @click="() => $router.push(`/meme/${meme.id}`)"
            />
          </td>
          <td>{{ meme.title }}</td>
          <td>{{ new Date(meme.timestamp).toLocaleString() }}</td>
          <td class="flex gap-4">
            <select
              class="select select-primary select-bordered w-full"
              id="visibility"
              v-model="meme.visibility"
              @change="
                (e) =>
                  client.user.updateMemeVisibility.mutate({
                    id: meme.id,
                    visibility: e.target.value,
                  })
              "
            >
              <option value="PUBLIC">Public</option>
              <option value="UNLISTED">Unlisted</option>
              <option value="PRIVATE">Private</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
    <PlayfulText word="Drafts" />
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
