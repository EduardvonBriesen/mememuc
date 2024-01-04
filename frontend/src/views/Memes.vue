<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import { getMeme, getAllMemes } from "@/utils/api";
import CommentSection from "@/components/CommentSection.vue";
import {
  ChevronRightIcon as NextIcon,
  ChevronLeftIcon as PreviousIcon,
  ArrowPathIcon as RandomIcon,
  PlayIcon as PlayIcon,
  PauseIcon as PauseIcon,
} from "@heroicons/vue/24/solid";

import router from "@/router";

const meme = ref<{
  id: string;
  base64: string;
  userId: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
} | null>(null);

const allMemes = ref<Array<{ id: string }>>([]);

const autoplay = ref(false);

let autoplayInterval: NodeJS.Timeout;

onMounted(async () => {
  let memeId = router.currentRoute.value.params.memeId as string;
  meme.value = await getMeme(memeId);
  allMemes.value = await getAllMemes();
  const currentIndex = allMemes.value.findIndex((m) => m.id === memeId);
  console.log(currentIndex);
  const storedAutoplay = localStorage.getItem("autoplay");
  autoplay.value = storedAutoplay ? JSON.parse(storedAutoplay) : false;
  console.log("Autoplay:", autoplay.value);
});

// Periodically call goToNextMeme if autoplay is enabled
watchEffect(() => {
  if (autoplay.value) {
    autoplayInterval = setInterval(() => {
      goToNextMeme();
    }, 3000);
  } else {
    clearInterval(autoplayInterval);
  }
});

function saveAutoplayState() {
  // Save autoplay state to localStorage
  localStorage.setItem("autoplay", JSON.stringify(autoplay.value));
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

async function goToPreviousMeme() {
  let memeId = router.currentRoute.value.params.memeId as string;
  const currentIndex = allMemes.value.findIndex((m) => m.id === memeId);
  console.log(currentIndex);
  console.log(allMemes.value.length - 1);
  if (currentIndex > 0) {
    const previousMemeId = allMemes.value[currentIndex - 1].id;
    meme.value = await getMeme(previousMemeId);
    router.push(`/meme/${previousMemeId}`);
  } else {
    const previousMemeId = allMemes.value[allMemes.value.length - 1].id;
    meme.value = await getMeme(previousMemeId);
    router.push(`/meme/${previousMemeId}`);
    console.log("Starting from the back.");
  }
}

async function goToNextMeme() {
  let memeId = router.currentRoute.value.params.memeId as string;
  const currentIndex = allMemes.value.findIndex((m) => m.id === memeId);
  console.log(currentIndex);
  console.log(allMemes.value.length - 1);
  if (currentIndex < allMemes.value.length - 1) {
    const nextMemeId = allMemes.value[currentIndex + 1].id;
    meme.value = await getMeme(nextMemeId);
    router.push(`/meme/${nextMemeId}`);
  } else {
    const nextMemeId = allMemes.value[0].id;
    meme.value = await getMeme(nextMemeId);
    router.push(`/meme/${nextMemeId}`);
    console.log("Starting from the front.");
  }
}

async function goToRandomMeme() {
  let memeId = router.currentRoute.value.params.memeId as string;
  const currentIndex = allMemes.value.findIndex((m) => m.id === memeId);
  const allIndicesExceptCurrent = allMemes.value
    .map((_, index) => index)
    .filter((index) => index !== currentIndex);

  if (allIndicesExceptCurrent.length > 0) {
    const randomIndex =
      allIndicesExceptCurrent[
        Math.floor(Math.random() * allIndicesExceptCurrent.length)
      ];
    const randomMemeId = allMemes.value[randomIndex].id;
    meme.value = await getMeme(randomMemeId);
    router.push(`/meme/${randomMemeId}`);
  } else {
    console.log("No other memes available for random selection.");
  }
}

function startAutoplay() {
  autoplay.value = true;
  saveAutoplayState();
  console.log("Autoplay:", autoplay.value);
}

function stopAutoplay() {
  autoplay.value = false;
  saveAutoplayState();
  console.log("Autoplay:", autoplay.value);

  clearInterval(autoplayInterval);
}
</script>

<template>
  <div>
    <div class="flex justify-center gap-4">
      <button class="btn btn-primary btn-outline" @click="goToPreviousMeme()">
        <PreviousIcon class="h-6 w-6" />
      </button>
      <button class="btn btn-primary btn-outline" @click="goToRandomMeme()">
        <RandomIcon class="h-6 w-6" />
      </button>
      <button
        class="btn btn-primary btn-outline playicon"
        :class="{ hide: autoplay }"
        @click="startAutoplay()"
      >
        <PlayIcon class="h-6 w-6" />
      </button>
      <button
        class="btn btn-primary btn-outline pauseicon"
        :class="{ hide: !autoplay }"
        @click="stopAutoplay()"
      >
        <PauseIcon class="h-6 w-6" />
      </button>
      <button class="btn btn-primary btn-outline" @click="goToNextMeme()">
        <NextIcon class="h-6 w-6" />
      </button>
    </div>
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
      <CommentSection v-if="meme" :meme-id="meme?.id || ''" />
    </div>
  </div>
</template>

<style>
.hide {
  display: none;
}
</style>
