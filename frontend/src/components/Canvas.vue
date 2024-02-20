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
import { client, getDraft, saveDraft, updateDraft } from "@/utils/api";

const onlineGeneration = ref(true);

const can = ref(null);

const resizeLocked = ref(true); // Initially locked

let canvas: fabric.Canvas;

//resize varibales
let resizing = false;
let lastPosX = 0;
let lastPosY = 0;

const activeObject: Ref<fabric.IText | fabric.BaseBrush | null> = ref(null);
const drawingMode = ref(false);
const targetFileSizeKB = ref(1000);
const memeTitle = ref("");
const memeDescription = ref("");
const memeVisibility = ref<"PUBLIC" | "UNLISTED" | "PRIVATE">("PUBLIC");
const saveModalOpen = ref(false);
const usertexts = ref("");
const templateId = ref<string | undefined>();
let textObjects = [];
let templateSrc = "";

const router = useRouter();

onMounted(async () => {
  const draftId = router.currentRoute.value.params.draftId as string;

  canvas = new fabric.Canvas(can.value);

  if (draftId) {
    const draft = await getDraft(draftId);
    canvas.loadFromJSON(draft.serializedCanvas, () => {
      canvas.renderAll();
      canvas.setWidth(draft.width);
      canvas.setHeight(draft.height);
    });
  }

  canvas.on("selection:created", (e: any) => {
    activeObject.value = e.selected[0];
  });

  canvas.on("selection:updated", (e: any) => {
    activeObject.value = e.selected[0];
  });

  canvas.on("selection:cleared", () => {
    activeObject.value = null;
  });

  // Apply initial lock state to existing canvas objects
  applyLockStateToObjects();
});

function clearCanvas() {
  canvas.clear();
  // other necessary cleanup or reinitialization
}

function applyLockStateToObjects() {
  canvas.forEachObject((obj) => {
    obj.selectable = !resizeLocked.value;
    obj.evented = !resizeLocked.value;
  });
}

function addText() {
  const text = new fabric.IText("Funny text goes here...", {
    left: ((activeObject.value as fabric.IText)?.left ?? 0) + 10,
    top: ((activeObject.value as fabric.IText)?.top ?? 0) + 10,
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  textObjects.push(text);

  // Possiblility to lock text with the resize lock
  // text.selectable = !resizeLocked.value;
  // text.evented = !resizeLocked.value;
}

function saveText() {
  const validTextObjects = canvas
    .getObjects()
    .filter((obj) => obj instanceof fabric.IText && textObjects.includes(obj));
  usertexts.value = validTextObjects
    .map((textObj: fabric.IText) => textObj.text)
    .join(". ");

  console.log("Textinhalte: " + usertexts);
}

async function setTemplate(src: string, template?: string) {
  if (src === "") {
    canvas.clear();
    canvas.setBackgroundColor("white", () => {
      canvas.setDimensions({ width: 500, height: 500 });
      canvas.renderAll();
    });
    return;
  }

  templateId.value = template;

  const img = new Image();
  // It is important to set crossOrigin to anonymous so that the background image is not tainted
  // this way toDataURL will work
  img.crossOrigin = "anonymous";

  img.onload = function () {
    const width = img.width ?? 500;
    const height = img.height ?? 500;
    const scale = 500 / Math.max(width, height);

    const fabricImg = new fabric.Image(img, {
      scaleX: scale,
      scaleY: scale,
    });

    // Apply lock state to the new image object
    fabricImg.selectable = !resizeLocked.value;
    fabricImg.evented = !resizeLocked.value;

    canvas.add(fabricImg);

    if (resizeLocked.value) {
      canvas.setWidth(width * scale);
      canvas.setHeight(height * scale);
      canvas.add(fabricImg);
      canvas.setBackgroundImage(fabricImg, canvas.renderAll.bind(canvas));
      return;
    }

    canvas.setActiveObject(fabricImg);
  };

  img.onerror = function (error) {
    console.error("Error loading image:", error);
  };

  img.src = src;
  templateSrc = src;
  console.log("Template set:", src);
}

function setDrawingMode(value: boolean) {
  drawingMode.value = value;
  canvas.isDrawingMode = value;
}

function generateMeme(
  targetFileSizeKB: number,
  memeTitle: string,
  description: string,
  usertexts: string,
) {
  // Check if there is a background image and it is not tainted
  // if (
  //   canvas.backgroundImage &&
  //   !(canvas.backgroundImage as fabric.Image).crossOrigin
  // ) {
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

  const meme = {
    base64: dataUrl,
    title: memeTitle,
    description: description,
    visibility: memeVisibility.value,
    usertexts: usertexts,
    templateId: templateId.value ?? "",
  };

  // append meme to local storage
  const memes = JSON.parse(localStorage.getItem("memes") || "[]");
  memes.push(meme);
  localStorage.setItem("memes", JSON.stringify(memes));

  //save image to mongoDB database
  client.meme.save.mutate(meme).then((res) => {
    console.log(res);
    openMemeSingleView(res.id);
  });
  console.log("Meme generated with filesize:", dataUrl.length / 1024);
  //   } else {
  //     console.error(
  //       "Background image is tainted. Ensure that it is hosted on the same domain or has proper CORS headers.",
  //     );
  //   }
}

// function generateMemeWithPrompt() {
//   saveText();
//   // Call the generateMeme function with the target file size
//   generateMeme(
//     targetFileSizeKB.value,
//     memeTitle.value,
//     memeDescription.value,
//     usertexts.value,
//   );
//   console.log("Target File Size:", targetFileSizeKB.value);
// }

async function generateMemeWithPrompt() {
  saveText();

  if (onlineGeneration.value) {
    // Online generation
    await generateMemeOnline();
  } else {
    // Offline generation
    generateMeme(
      targetFileSizeKB.value,
      memeTitle.value,
      memeDescription.value,
      usertexts.value,
    );
    console.log("Offline generation selected.");
  }

  console.log("Target File Size:", targetFileSizeKB.value);
}

async function generateMemeOnline() {
  saveText(); // Ensure text is saved if needed

  const template = templateSrc;
  console.log("Template:", template);
  const memes = [
    {
      title: memeTitle.value,
      texts: textObjects.map((textObj) => ({
        text: textObj.text,
        x: textObj.left,
        y: textObj.top,
        size: textObj.fontSize,
        color: textObj.fill,
      })),
    },
  ];
  const input = {
    template,
    memes,
  };

  console.log("Memes input:", input);

  try {
    const result = await client.meme.create.mutate(input);

    console.log("Memes created online:", result);

    const url = new URL(result[0]);
    const id = url.pathname.split("/").pop();

    // Call openMemeSingleView with the extracted ID
    openMemeSingleView(id ?? "");
  } catch (error) {
    console.error("Error creating memes online:", error);
  }
}

function openMemeSingleView(memeId: string) {
  router.push(`/meme/${memeId}`);
}

function saveDraftHandler() {
  const draftId = router.currentRoute.value.params.draftId as string;

  if (draftId) {
    const serializedCanvas = JSON.stringify(canvas);
    updateDraft(
      draftId,
      serializedCanvas,
      canvas.getWidth(),
      canvas.getHeight(),
    );
    return;
  }

  const serializedCanvas = JSON.stringify(canvas);
  const name = window.prompt("Enter a name for your draft:", "My Draft");
  if (!name) return;
  saveDraft(name, serializedCanvas, canvas.getWidth(), canvas.getHeight());
}

function startResizing(e: MouseEvent) {
  if (resizeLocked.value) return; // Prevent resizing if locked

  resizing = true;
  lastPosX = e.clientX;
  lastPosY = e.clientY;
  document.addEventListener("mousemove", resizeCanvas);
  document.addEventListener("mouseup", stopResizing);
}

function resizeCanvas(e: MouseEvent) {
  if (!resizing || resizeLocked.value) return; // Check lock state
  const dx = e.clientX - lastPosX;
  const dy = e.clientY - lastPosY;
  if (
    (canvas.width as number) + dx > 100 &&
    (canvas.height as number) + dy > 100
  ) {
    // Minimum size check
    canvas.setWidth((canvas.width as number) + dx);
    canvas.setHeight((canvas.height as number) + dy);
    canvas.renderAll();
  }
  lastPosX = e.clientX;
  lastPosY = e.clientY;
}

function stopResizing() {
  if (resizeLocked.value) return; // Check lock state

  resizing = false;
  document.removeEventListener("mousemove", resizeCanvas);
  document.removeEventListener("mouseup", stopResizing);
}

function toggleResizeLock() {
  resizeLocked.value = !resizeLocked.value;

  // Update the selectable and evented properties for all canvas objects
  canvas.forEachObject((obj) => {
    if (!(obj instanceof fabric.Image)) return;
    obj.selectable = !resizeLocked.value;
    obj.evented = !resizeLocked.value;
  });

  canvas.renderAll(); // Re-render the canvas to apply changes
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
        :init-template="!router.currentRoute.value.params.draftId"
        :setTemplate="setTemplate"
        :setDrawingMode="setDrawingMode"
        @clearCanvas="clearCanvas"
      />

      <div class="card bg-neutral h-fit w-fit">
        <div class="card-body">
          <canvas ref="can" width="500" height="500"></canvas>
          <div
            class="resize-handle"
            @mousedown="startResizing"
            style="
              cursor: nwse-resize;
              position: absolute;
              bottom: 0;
              right: 0;
              width: 20px;
              height: 20px;
              background: gray;
            "
          ></div>
        </div>
      </div>

      <div class="modal" :class="{ 'modal-open': saveModalOpen }" role="dialog">
        <form
          class="modal-box w-3/2 flex max-w-xl flex-col"
          @submit.prevent="generateMemeWithPrompt"
        >
          <label for="memeTitle" class="label label-text">Meme Title</label>
          <input
            id="memeTitle"
            required
            type="text"
            class="input input-bordered"
            placeholder="Enter your meme title"
            v-model="memeTitle"
          />
          <label for="memeDescription" class="label label-text">
            Meme Description
          </label>
          <input
            id="memeDescription"
            required
            type="text"
            class="input input-bordered"
            placeholder="Enter your meme description"
            v-model="memeDescription"
          />
          <label for="fileSize" class="label label-text">
            Max File Size: {{ targetFileSizeKB }} KB
          </label>
          <input
            class="range range-primary"
            id="fileSize"
            type="range"
            min="50"
            max="2500"
            step="50"
            v-model="targetFileSizeKB"
          />
          <label for="visibility" class="label label-text"> Visibility </label>
          <select
            class="select select-bordered"
            id="visibility"
            v-model="memeVisibility"
          >
            <option value="PUBLIC">Public</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PRIVATE">Private</option>
          </select>

          <button class="btn btn-primary mt-4 w-32" type="submit">
            Generate Meme
          </button>

          <div class="form-control w-52">
            <label class="label cursor-pointer">
              <span class="label-text"
                >Generation Mode:
                {{ onlineGeneration ? "Online" : "Offline" }}</span
              >
              <input
                type="checkbox"
                class="toggle toggle-secondary"
                v-model="onlineGeneration"
              />
            </label>
          </div>
        </form>
        <div class="modal-backdrop" @click="saveModalOpen = false" />
      </div>

      <div class="flex justify-center gap-4">
        <button class="btn btn-primary w-48" @click="saveModalOpen = true">
          Generate Meme
        </button>
        <button class="btn btn-secondary w-48" @click="toggleResizeLock">
          {{ resizeLocked.valueOf() ? "Unlock Canvas" : "Lock Canvas" }}
        </button>
        <button class="btn btn-primary w-48" @click="saveDraftHandler">
          Save Draft
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
