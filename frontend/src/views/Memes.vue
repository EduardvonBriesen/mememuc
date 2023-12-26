<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getMeme } from "@/utils/api";
import PlayfulText from "@/components/PlayfulText.vue";

const meme = ref<{
  id: string;
  base64: string;
  userId: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
} | null>(null);

onMounted(async () => {
  const route = useRoute();
  const memeId = route.params.memeId as string;
  meme.value = await getMeme(memeId);
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
    <div class="flex flex-col items-center gap-5 py-4">
      <PlayfulText word="Comments" />
      <input
        type="text"
        placeholder="Add a comment"
        class="input input-bordered w-full max-w-xs"
      />
    </div>
  </div>
</template>
