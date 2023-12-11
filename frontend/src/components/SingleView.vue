<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

async function getMemeById(memeId: any) {
  try {
    const apiUrl = `http://localhost:3001/memes/${memeId}`;

    const response = await fetch(apiUrl);

    if (response.ok) {
      const memeData = await response.json();
      console.log("Meme Data:", memeData);

      return memeData;
    } else {
      console.error("Failed to fetch meme:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function loadMeme() {
  const route = useRoute();
  const memeId = route.params.memeId;
  const meme = await getMemeById(memeId);
  console.log("MemeData:", meme.memeData);

  const imgSrc = "data:image/png;base64, " + meme.memeData;
  const memeImage = document.getElementById("memeImage") as HTMLImageElement;
  memeImage.setAttribute("src", imgSrc);
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

onMounted(() => {
  loadMeme();
});
</script>

<template>
  <div class="flex w-fit flex-col justify-center gap-4">
    <div class="card bg-neutral h-fit w-fit">
      <div class="card-body">
        <img id="memeImage" alt="Meme Image" />
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
