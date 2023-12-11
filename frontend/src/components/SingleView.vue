<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getMeme } from "@/utils/api";

const meme = ref<{
  base64: string;
  id: string;
  timestamp: string;
  user: string;
}>();

onMounted(() => {
  loadMeme();
});

async function loadMeme() {
  const route = useRoute();
  const memeId = route.params.memeId as string;
  meme.value = await getMeme(memeId);
}

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
</template>
