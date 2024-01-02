<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getComments, createComment } from "@/utils/api";
import PlayfulText from "@/components/PlayfulText.vue";
import { store } from "@/utils/store";

const props = defineProps<{
  memeId: string;
}>();

const comments = ref<
  {
    id: string;
    userId: string;
    timestamp: string;
    memeId: string | null;
    text: string;
    username: string;
  }[]
>([]);
const userComment = ref("");

onMounted(async () => {
  comments.value = await getComments(props.memeId);
});

const submitComment = async () => {
  const comment = userComment.value;
  const newComment = await createComment(props.memeId, comment);
  comments.value.push({
    ...newComment,
    username: store.user?.username as string,
  });
  userComment.value = "";
};
</script>

<template>
  <div class="flex w-96 flex-col items-center gap-5 py-4">
    <PlayfulText word="Comments" />
    <form
      v-if="store.user"
      @submit.prevent="submitComment"
      class="flex w-full flex-row justify-center gap-2"
    >
      <input
        id="comment"
        required
        type="text"
        class="input input-bordered"
        placeholder="Enter your comment"
        v-model="userComment"
      />
      <button class="btn btn-primary">Submit</button>
    </form>
    <div class="flex w-full flex-col-reverse items-center">
      <div
        class="chat w-full"
        :class="{
          'chat-start': comment.userId !== store.user?.id,
          'chat-end': comment.userId === store.user?.id,
        }"
        v-for="comment in comments"
        :key="comment.id"
      >
        <div
          class="chat-image avatar placeholder tooltip"
          :data-tip="comment.username"
        >
          <div
            class="bg-neutral w-10 rounded-full"
            :class="{
              'bg-secondary': comment.userId === store.user?.id,
            }"
          >
            <span>{{ comment.username[0].toUpperCase() }}</span>
          </div>
        </div>
        <div class="chat-footer">
          <time class="text-xs opacity-50">
            {{ new Date(comment.timestamp).toLocaleString() }}
          </time>
        </div>
        <div class="chat-bubble">
          <p>{{ comment.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
