<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  HandThumbUpIcon as UpIcon,
  HandThumbDownIcon as DownIcon,
  MegaphoneIcon as SpeechIcon,
} from "@heroicons/vue/24/solid";
import { getMemes, getUserVotes, setUserVote } from "@/utils/api";
import { store } from "@/utils/store";
import PlayfulText from "@/components/PlayfulText.vue";

const memes = ref<
  {
    id: string;
    user: string;
    link: string;
    description: string;
    base64: string;
    title: string;
    timestamp: string;
    upvotes: number;
    downvotes: number;
  }[]
>();

const userVotes = ref<{ [key: string]: boolean | undefined }>({});

onMounted(async () => {
  getMemes({ image: true }).then((data) => {
    memes.value = data;
  });
  getUserVotes().then((data) => {
    userVotes.value = Object.fromEntries(
      data.map((vote) => [vote.memeId, vote.upvote]),
    );
  });
});

function updateVote(memeId: string, upvote: boolean) {
  if (userVotes.value[memeId] === upvote) {
    userVotes.value[memeId] = undefined;
    setUserVote(memeId);
  } else {
    userVotes.value[memeId] = upvote;
    setUserVote(memeId, upvote);
  }
}

function generateText(memeId: string): string {
  const meme = memes.value?.find((meme) => meme.id === memeId);

  if (!meme) {
    return "This meme does not exist.";
  }

  const description =
    meme.description === undefined
      ? "There is no description for this meme."
      : "The description is: " + meme.description;

  const text =
    "This meme was uploaded on " +
    new Date(meme.timestamp).toLocaleDateString() +
    " from user " +
    meme.user +
    ". It has " +
    meme.upvotes +
    " Upvotes and " +
    meme.downvotes +
    " Downvotes. " +
    description;

  return text;
}

function generateSpeech(memeId: string) {
  const textToSpeak = generateText(memeId);

  var synth = window.speechSynthesis;
  console.log("Text2Speak: " + textToSpeak);
  var utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = "en-US";
  synth.speak(utterance);
}
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4">
    <div class="flex flex-col items-center gap-4">
      <PlayfulText word="Memes" />
      <div
        class="card bg-base-100 shadow-xl"
        v-for="meme in memes"
        :key="meme.id"
      >
        <!-- Speech Icon trigger-->
        <div class="m-3 flex justify-end">
          <button
            class="btn btn-outline btn-info w-25 rounded-full"
            @click="() => generateSpeech(meme.id)"
          >
            Describe it
            <SpeechIcon class="h-4 w-4" />
          </button>
        </div>

        <figure
          @click="$router.push(`/meme/${meme.id}`)"
          class="cursor-pointer"
        >
          <img :src="meme.base64" />
        </figure>
        <div class="card-body">
          <div class="card-actions justify-evenly">
            <button
              v-if="store.user"
              class="btn btn-circle btn-error"
              :class="{
                'btn-outline':
                  userVotes[meme.id] === undefined || userVotes[meme.id],
              }"
              @click="() => updateVote(meme.id, false)"
            >
              <DownIcon class="h-6 w-6" />
            </button>
            <span
              class="badge badge-outline"
              :class="{
                // TODO: cleanup
                'badge-success':
                  meme.upvotes -
                    meme.downvotes +
                    (userVotes[meme.id] === undefined
                      ? 0
                      : userVotes[meme.id]
                        ? 1
                        : -1) >
                  0,
                'badge-error':
                  meme.upvotes -
                    meme.downvotes +
                    (userVotes[meme.id] === undefined
                      ? 0
                      : userVotes[meme.id]
                        ? 1
                        : -1) <
                  0,
              }"
            >
              {{
                meme.upvotes -
                meme.downvotes +
                (userVotes[meme.id] === undefined
                  ? 0
                  : userVotes[meme.id]
                    ? 1
                    : -1)
              }}
            </span>
            <button
              v-if="store.user"
              class="btn btn-circle btn-success"
              :class="{
                'btn-outline':
                  userVotes[meme.id] === undefined || !userVotes[meme.id],
              }"
              @click="() => updateVote(meme.id, true)"
            >
              <UpIcon class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
