<script setup lang="ts">
import { fabric } from "fabric";
import { Ref, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ChatBubbleBottomCenterTextIcon as TextIcon,
  PaintBrushIcon as BrushIcon,
} from "@heroicons/vue/24/solid";
import TextControl from "@/components/TextControl.vue";
//import TemplateSelection from "@/components/TemplateSelection.vue";
import BrushControl from "./BrushControl.vue";
import TemplateControl from "@/components/template/TemplateControl.vue";
import { createMeme } from "@/utils/api";

const can = ref(null);

let canvas: fabric.Canvas;

const activeObject: Ref<fabric.IText | fabric.BaseBrush | null> = ref(null);
const drawingMode = ref(false);
const targetFileSizeKB = ref(1000); // Default value
const memeTitle = ref(""); // Default value

const router = useRouter();

onMounted(async () => {
  canvas = new fabric.Canvas(can.value);

  canvas.on("selection:created", (e: any) => {
    activeObject.value = e.selected[0];
  });

  canvas.on("selection:updated", (e: any) => {
    activeObject.value = e.selected[0];
  });

  canvas.on("selection:cleared", () => {
    activeObject.value = null;
  });
});

function addText() {
  const text = new fabric.IText("hello world", {
    left: (activeObject.value?.left ?? 0) + 10,
    top: (activeObject.value?.top ?? 0) + 10,
  });
  canvas.add(text);
  canvas.setActiveObject(text);
}

async function setTemplate(src: string) {
  if (src === "") {
    canvas.clear();
    canvas.setBackgroundColor("white", () => {
      canvas.setDimensions({ width: 500, height: 500 });
      canvas.renderAll();
    });
    return;
  }

  const img = new Image();
  // It is important to set crossOrigin to anonymous so that the background image is not tainted
  // this way toDataURL will work
  img.crossOrigin = "anonymous";

  img.onload = function () {
    const width = img.width ?? 500;
    const height = img.height ?? 500;

    const scale = 500 / width;

    const fabricImg = new fabric.Image(img, {
      scaleX: scale,
      scaleY: scale,
    });

    canvas.setWidth(width * scale);
    canvas.setHeight(height * scale);

    canvas.setBackgroundImage(fabricImg, canvas.renderAll.bind(canvas));
    canvas.setWidth(width * scale);
    canvas.setHeight(height * scale);

    canvas.setBackgroundImage(fabricImg, canvas.renderAll.bind(canvas));
  };

  img.onerror = function (error) {
    console.error("Error loading image:", error);
  };

  img.src = src;
}

function setDrawingMode(value: boolean) {
  drawingMode.value = value;
  canvas.isDrawingMode = value;
}

function generateMeme(targetFileSizeKB: number, memeTitle: string) {
  // Check if there is a background image and it is not tainted
  if (
    canvas.backgroundImage &&
    !(canvas.backgroundImage as fabric.Image).crossOrigin
  ) {
    let quality = 1; // Initial quality setting

    // Generate the image data URL and check its file size
    let dataUrl;
    do {
      dataUrl = canvas.toDataURL({ format: "png", quality });
      const fileSizeKB = dataUrl.length / 1024;

      // If the file size exceeds the target, reduce the quality and try again
      if (fileSizeKB > targetFileSizeKB) {
        quality -= 0.01; // You can adjust the step size as needed
      }
    } while (quality > 0 && dataUrl.length / 1024 > targetFileSizeKB);

    if (dataUrl.length / 1024 > targetFileSizeKB) {
      window.alert(
        "Failed to generate meme, specified filesize too small. Enter a larger desired maximum file size in kilobytes (KB)",
      );
      // const targetFileSizeKB = userInput ? parseFloat(userInput) : 1000;

      // Call the generateMeme function with the target file size
      // generateMeme(targetFileSizeKB);
      return;
    }

    //save image to mongoDB database
    createMeme(dataUrl, memeTitle).then((res) => {
      console.log(res);
      openMemeSingleView(res.id);
    });
    console.log("Meme generated with filesize:", dataUrl.length / 1024);
  } else {
    console.error(
      "Background image is tainted. Ensure that it is hosted on the same domain or has proper CORS headers.",
    );
  }
}

function generateMemeWithPrompt() {
  // const userInput = window.prompt(
  //   "Enter the desired maximum file size in kilobytes (KB):",
  //   "1000",
  // );

  // const targetFileSizeKB = userInput ? parseFloat(userInput) : 1000; // Default value

  // Call the generateMeme function with the target file size
  generateMeme(targetFileSizeKB.value, memeTitle.value);
  console.log("Target File Size:", targetFileSizeKB.value);
}

function openMemeSingleView(memeId: string) {
  router.push(`/meme/${memeId}`);
}
</script>

<template>
  <div class="flex items-start gap-8">
    <div class="flex flex-col gap-4">
      <button class="btn btn-primary w-48" @click="addText">
        Add Text
        <TextIcon class="h-6 w-6" />
      </button>
      <button
        class="btn btn-primary w-48"
        :class="{ 'btn-outline': !drawingMode }"
        @click="setDrawingMode(!drawingMode)"
      >
        Add Brush
        <BrushIcon class="h-6 w-6" />
      </button>
    </div>

    <div class="flex w-fit flex-col justify-center gap-4">
      <TemplateControl
        :setTemplate="setTemplate"
        :setDrawingMode="setDrawingMode"
      />

      <div class="card bg-neutral h-fit w-fit">
        <div class="card-body">
          <canvas ref="can" width="500" height="500"></canvas>
        </div>
      </div>
      <!-- <TemplateGeneration  :canvas="canvas"  /> -->
      <div class="filesize-prompt flex justify-center gap-4">
        <label for="fileSize" class="text-lg font-bold">
          Max File Size (KB):
        </label>
        <input
          id="fileSize"
          type="range"
          min="50"
          max="2500"
          step="50"
          v-model="targetFileSizeKB"
        />
        <span class="text-lg">{{ targetFileSizeKB }} KB</span>
      </div>
      <div class="flex justify-center gap-4">
        <label for="memeTitle" class="center-vertically text-lg font-bold">
          Meme Title:
        </label>
        <input
          id="memeTitle"
          required
          type="text"
          class="input input-bordered"
          placeholder="Enter your meme title"
          v-model="memeTitle"
        />
      </div>

      <div class="flex justify-center gap-4">
        <button class="btn btn-primary w-48" @click="generateMemeWithPrompt">
          Generate Meme
        </button>
      </div>
    </div>
    <div>
      <TextControl
        v-if="activeObject"
        :canvas="canvas"
        :activeObject="activeObject"
      />
      <BrushControl v-if="drawingMode" :canvas="canvas" />
    </div>
  </div>
</template>

<style>
.hidden {
  display: none;
}

.center-vertically {
  margin-top: auto;
  margin-bottom: auto;
}
</style>
