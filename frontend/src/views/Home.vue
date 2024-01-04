<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  HandThumbUpIcon as UpIcon,
  HandThumbDownIcon as DownIcon,
  MegaphoneIcon as SpeechIcon,
} from "@heroicons/vue/24/solid";
import {
  getAllMemes,
  getUserVotes,
  setUserVote,
  getMeme,
  getTemplateImage,
  getUserName,
} from "@/utils/api";
import { store } from "@/utils/store";
import PlayfulText from "@/components/PlayfulText.vue";

const memes = ref<
  {
    id: string;
    timestamp: string;
    base64: string;
    userId: string;
    upvotes: number;
    downvotes: number;
  }[]
>();

const userVotes = ref<{ [key: string]: boolean | undefined }>({});

onMounted(async () => {
  getAllMemes().then((data) => {
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
function timestampToDate(timestamp) {
  const dateobject = new Date(timestamp);
  const onlydate = dateobject.toISOString().split("T")[0];
  return onlydate;
}

function generateText(memeId: string): Promise<string> {
  console.log("loading...");
  return getMeme(memeId).then((data) => {
    var memeData = data;
    console.log("Meme " + memeData);
    var image = memeData.base64; //ToDo: Meme Bildanalyse starten
    console.log("image " + image);
    var timestamp = timestampToDate(memeData.timestamp);
    console.log("Time " + timestamp);
    var userName = memeData.userId; //ToDo: UserID mit UserName ersetzen
    console.log("userId " + userName);
    var upvote = memeData.upvotes;
    console.log("upvote " + upvote);
    var downvote = memeData.downvotes;
    console.log("downvote " + downvote);
    console.log("pre-description " + description); //ToDo: Description aus DB ziehen - Es fehlt noch MongoPreData
    if (memeData.description === undefined) {
      var description = "There is no description for this meme.";
    } else {
      var description = "The description is: " + memeData.description;
    }
    console.log("description " + description);
    var text =
      "This meme was uploaded on " +
      timestamp +
      " from user " +
      userName +
      ". It has " +
      upvote +
      " Upvotes and " +
      downvote +
      " Downvotes. " +
      description;
    console.log("text " + text);
    return text;
  });
}

function generateSpeech(memeId: string) {
  generateText(memeId).then((textToSpeak) => {
    var synth = window.speechSynthesis;
    console.log("Text2Speak: " + textToSpeak);
    var utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "en-US";
    synth.speak(utterance);
  });
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
