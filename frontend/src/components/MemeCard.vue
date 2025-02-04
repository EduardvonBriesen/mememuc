<script setup lang="ts">
import {
  HandThumbUpIcon as UpIcon,
  HandThumbDownIcon as DownIcon,
  MegaphoneIcon as SpeechIcon,
} from "@heroicons/vue/24/solid";
import { onMounted, ref } from "vue";
import { getUserVotes, setUserVote } from "@/utils/api";
import { store } from "@/utils/store";

const props = defineProps<{
  meme: {
    id: string;
    user: string;
    link: string;
    description: string;
    base64: string;
    title: string;
    timestamp: string;
    upvotes: number;
    downvotes: number;
    usertexts: string;
    template?: string;
  };
}>();

const userVotes = ref<{ [key: string]: boolean | undefined }>({});

onMounted(async () => {
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

function generateSpeech() {
  const description =
    props.meme.description === undefined
      ? "There is no description for this meme."
      : "The description is: " + props.meme.description + ".";

  const text =
    "The meme " +
    props.meme.title +
    " was uploaded on " +
    new Date(props.meme.timestamp).toLocaleDateString() +
    " from user " +
    props.meme.user +
    ". It has " +
    props.meme.upvotes +
    " Upvotes and " +
    props.meme.downvotes +
    " Downvotes. " +
    description +
    " This meme contains the following texts: " +
    props.meme.usertexts +
    (props.meme.template
      ? " and is based on template " + props.meme.template
      : "");

  var synth = window.speechSynthesis;
  console.log("Text: " + text);
  var utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  synth.speak(utterance);
}
</script>

<template>
  <div class="card bg-base-300 shadow-xl">
    <figure
      @click="$router.push(`/meme/${props.meme.id}`)"
      class="cursor-pointer"
    >
      <img :src="props.meme.base64" />
    </figure>
    <div class="card-body">
      <h2 class="card-title justify-between">
        <span>{{ props.meme.title }}</span>
        <span
          class="badge badge-outline"
          :class="{
            // TODO: cleanup
            'badge-success':
              props.meme.upvotes -
                props.meme.downvotes +
                (userVotes[props.meme.id] === undefined
                  ? 0
                  : userVotes[props.meme.id]
                    ? 1
                    : -1) >
              0,
            'badge-error':
              props.meme.upvotes -
                props.meme.downvotes +
                (userVotes[props.meme.id] === undefined
                  ? 0
                  : userVotes[props.meme.id]
                    ? 1
                    : -1) <
              0,
          }"
        >
          {{
            props.meme.upvotes -
            props.meme.downvotes +
            (userVotes[props.meme.id] === undefined
              ? 0
              : userVotes[props.meme.id]
                ? 1
                : -1)
          }}
        </span>
      </h2>
      <p>
        {{ props.meme.description }}
      </p>

      <div class="card-actions justify-evenly">
        <button
          v-if="store.user"
          class="btn btn-circle btn-error"
          :class="{
            'btn-outline':
              userVotes[props.meme.id] === undefined ||
              userVotes[props.meme.id],
          }"
          @click="() => updateVote(props.meme.id, false)"
        >
          <DownIcon class="h-6 w-6" />
        </button>
        <!-- Speech Icon trigger-->

        <button
          class="btn btn-outline btn-info w-25 rounded-full"
          @click="generateSpeech"
        >
          Describe it
          <SpeechIcon class="h-4 w-4" />
        </button>

        <button
          v-if="store.user"
          class="btn btn-circle btn-success"
          :class="{
            'btn-outline':
              userVotes[props.meme.id] === undefined ||
              !userVotes[props.meme.id],
          }"
          @click="() => updateVote(props.meme.id, true)"
        >
          <UpIcon class="h-6 w-6" />
        </button>
      </div>
    </div>
  </div>
</template>
