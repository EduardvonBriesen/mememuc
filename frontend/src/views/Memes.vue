<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getMeme, getAllMemes } from "@/utils/api";
import CommentSection from "@/components/CommentSection.vue";
import {
  ChevronRightIcon as NextIcon,
  ChevronLeftIcon as PreviousIcon,
  ArrowPathIcon as RandomIcon,
} from "@heroicons/vue/24/solid";

const router = useRouter();

const meme = ref<{
  id: string;
  base64: string;
  userId: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
} | null>(null);

const allMemes = ref<Array<{ id: string }>>([]);
const route = useRoute();
const memeId = route.params.memeId as string;

onMounted(async () => {
  meme.value = await getMeme(memeId);
  allMemes.value = await getAllMemes();
  const currentIndex = allMemes.value.findIndex((m) => m.id === memeId);
  console.log(currentIndex);
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

async function goToPreviousMeme() {
  console.log(memeId);
  const currentIndex = allMemes.value.findIndex((m) => m.id === memeId);
  console.log(currentIndex);
  console.log(allMemes.value.length - 1);
  if (currentIndex > 0) {
    const previousMemeId = allMemes.value[currentIndex - 1].id;
    console.log(previousMemeId);
    router.push(`/meme/${previousMemeId}`); // Warum funktioniert das nicht?
    window.location.href = `/meme/${previousMemeId}`;
  } else {
    const previousMemeId = allMemes.value[allMemes.value.length - 1].id;
    router.push(`/meme/${previousMemeId}`); // Warum funktioniert das nicht?
    window.location.href = `/meme/${previousMemeId}`;
    console.log("Starting from the back.");
  }
}

async function goToNextMeme() {
  console.log(memeId);
  const currentIndex = allMemes.value.findIndex((m) => m.id === memeId);
  console.log(currentIndex);
  console.log(allMemes.value.length - 1);
  if (currentIndex < allMemes.value.length - 1) {
    const nextMemeId = allMemes.value[currentIndex + 1].id;
    console.log(nextMemeId);
    router.push(`/meme/${nextMemeId}`); // Warum funktioniert das nicht?
    window.location.href = `/meme/${nextMemeId}`;
  } else {
    const nextMemeId = allMemes.value[0].id;
    router.push(`/meme/${nextMemeId}`); // Warum funktioniert das nicht?
    window.location.href = `/meme/${nextMemeId}`;
    console.log("Starting from the front.");
  }
}

async function goToRandomMeme() {
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
    router.push(`/meme/${randomMemeId}`); // Warum funktioniert das nicht?
    window.location.href = `/meme/${randomMemeId}`;
  } else {
    console.log("No other memes available for random selection.");
  }
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
