<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getComments, getMeme, createComment } from "@/utils/api";
import PlayfulText from "@/components/PlayfulText.vue";
import { store } from "@/utils/store";

const meme = ref<{
  id: string;
  base64: string;
  userId: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
} | null>(null);

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

const submitComment = async () => {
  const memeId = meme.value?.id as string;
  const comment = userComment.value;
  const newComment = await createComment(memeId, comment);
  comments.value.push({
    ...newComment,
    username: store.user?.username as string,
  });
  userComment.value = "";
};

onMounted(async () => {
  const route = useRoute();
  const memeId = route.params.memeId as string;
  meme.value = await getMeme(memeId);
  comments.value = await getComments(memeId);
});

function downloadMeme() {
  // Create a link element and trigger a click to download the image
  const link = document.createElement("a");
  const memeImage = document.getElementById("memeImage") as HTMLImageElement;
  link.href = memeImage.src;
  link.download = "my_meme.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function shareMeme() {
  try {
    const currentUrl = window.location.href;

    await navigator.clipboard.writeText(currentUrl);

    console.log("URL copied to clipboard:", currentUrl);
  } catch (error) {
    console.error("Error copying URL to clipboard:", error);
  }
}
</script>

<template>
  <div class="flex flex-col items-center p-16">
    <div class="flex w-fit flex-col justify-center gap-4">
      <div class="card bg-neutral h-fit w-fit">
        <div class="card-body">
          <img id="memeImage" alt="Meme Image" :src="meme?.base64" />
        </div>
      </div>
      <div class="flex justify-center gap-4">
        <button class="btn btn-primary w-48" @click="downloadMeme">
          Download
        </button>
        <button class="btn btn-primary w-48" @click="shareMeme">Share</button>
      </div>
    </div>
    <div class="flex w-96 flex-col items-center gap-5 py-4">
      <PlayfulText word="Comments" />
      <form
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
      <div class="flex w-full flex-col items-center gap-2">
        <div
          class="chat chat-start w-full"
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
                'bg-primary': comment.userId === meme?.userId,
                'bg-secondary': comment.userId !== store.user?.id,
              }"
            >
              <span>{{ comment.username[0].toUpperCase() }}</span>
            </div>
          </div>
          <div class="chat-header flex">
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
  </div>
</template>
