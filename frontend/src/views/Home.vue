<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  HandThumbUpIcon as UpIcon,
  HandThumbDownIcon as DownIcon,
} from "@heroicons/vue/24/solid";
import { getAllMemes, getUserVotes, setUserVote } from "@/utils/api";

const username = "test-user"; // TODO: get username from login

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
  getUserVotes(username).then((data) => {
    userVotes.value = Object.fromEntries(
      data.map((vote) => [vote.memeId, vote.upvote]),
    );
  });
});

function updateVote(memeId: string, upvote: boolean) {
  if (userVotes.value[memeId] === upvote) {
    userVotes.value[memeId] = undefined;
    setUserVote(username, memeId);
  } else {
    userVotes.value[memeId] = upvote;
    setUserVote(username, memeId, upvote);
  }
}
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4 p-16">
    <div class="prose">
      <h1>Meme Muc</h1>
      <p>
        This is a meme generator for the Online Multimedia lecture at LMU
        Munich.
      </p>
    </div>
    <router-link to="editor" class="btn btn-primary">Generate Meme</router-link>
    <router-link to="register" class="btn btn-primary"
      >Register new Account</router-link
    >
    <router-link to="login" class="btn btn-primary">Login</router-link>
    <div class="flex flex-col gap-4">
      <h2>Recent Memes</h2>
      <div
        class="card bg-base-100 shadow-xl"
        v-for="meme in memes"
        :key="meme.id"
      >
        <figure>
          <img :src="meme.base64" />
        </figure>
        <div class="card-body">
          <div class="card-actions justify-between">
            <button
              class="btn btn-circle btn-primary"
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
              class="btn btn-circle btn-primary"
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
