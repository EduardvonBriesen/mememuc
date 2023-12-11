<script setup lang="ts">
import { onMounted } from "vue";

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

async function loadMeme(memeId: any) {
  const meme = await getMemeById(memeId);
  console.log("MemeData:", meme.memeData);

  const imgSrc = "data:image/png;base64, " + meme.memeData;
  const memeImage = document.getElementById("memeImage") as HTMLImageElement;
  memeImage.setAttribute("src", imgSrc);
}

onMounted(() => {
  const id = "65770dc8f2f8073420496e82"; // For testing purposes
  loadMeme(id);
});
</script>

<template>
  <div class="flex w-fit flex-col justify-center gap-4">
    <div class="card bg-neutral h-fit w-fit">
      <div class="card-body">
        <img id="memeImage" alt="Meme Image" />
      </div>
    </div>
  </div>
</template>
