// ===================================
// VYROX STUDIO
// Developer: Rishikesh Singh
// ===================================


// PAGE NAVIGATION

const pageNames = {
  overview: "Overview",
  photo: "Photo Studio",
  video: "Video Studio",
  ai: "AI Studio",
  effects: "Effects & Assets",
  settings: "Settings"
};

function showPage(page) {
  document.querySelectorAll(".page").forEach(element => {
    element.classList.remove("active");
  });

  document.querySelectorAll(".nav-item").forEach(element => {
    element.classList.remove("active");
  });

  const selectedPage = document.getElementById(page);

  if (!selectedPage) return;

  selectedPage.classList.add("active");

  const selectedButton = document.querySelector(
    `.nav-item[data-page="${page}"]`
  );

  if (selectedButton) {
    selectedButton.classList.add("active");
  }

  document.getElementById("pageTitle").textContent =
    pageNames[page] || "VYROX STUDIO";
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});


// ===================================
// PHOTO EDITOR
// ===================================

const canvas = document.getElementById("photoCanvas");
const ctx = canvas.getContext("2d");

const photoUpload = document.getElementById("photoUpload");
const emptyPhoto = document.getElementById("emptyPhoto");

let originalImage = null;

let rotation = 0;
let flipped = false;
let selectedFilter = "original";

const defaultSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0
};

let photoSettings = { ...defaultSettings };


// IMAGE UPLOAD

photoUpload.addEventListener("change", event => {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image.");
    return;
  }

  const image = new Image();

  image.onload = () => {
    originalImage = image;

    rotation = 0;
    flipped = false;
    selectedFilter = "original";

    photoSettings = { ...defaultSettings };

    updateControls();

    emptyPhoto.hidden = true;
    canvas.hidden = false;

    renderPhoto();
  };

  image.onerror = () => {
    alert("Unable to load this image.");
  };

  image.src = URL.createObjectURL(file);
});


// FILTER SETTINGS

function getFilterSettings() {
  let brightness = photoSettings.brightness;
  let contrast = photoSettings.contrast;
  let saturation = photoSettings.saturation;
  let warmth = photoSettings.warmth;

  switch (selectedFilter) {

    case "mono":
      saturation = 0;
      break;

    case "vivid":
      saturation = Math.min(200, saturation + 40);
      contrast = Math.min(200, contrast + 15);
      break;

    case "fade":
      contrast = Math.max(0, contrast - 25);
      brightness = Math.min(200, brightness + 8);
      break;

    case "cool":
      warmth -= 35;
      break;

    case "warm":
      warmth += 35;
      break;

  }

  return {
    brightness,
    contrast,
    saturation,
    warmth
  };
}


// RENDER IMAGE

function renderPhoto() {
  if (!originalImage) return;

  const settings = getFilterSettings();

  const sideways = Math.abs(rotation % 180) === 90;

  canvas.width = sideways
    ? originalImage.height
    : originalImage.width;

  canvas.height = sideways
    ? originalImage.width
    : originalImage.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  ctx.translate(
    canvas.width / 2,
    canvas.height / 2
  );

  ctx.rotate(rotation * Math.PI / 180);

  ctx.scale(
    flipped ? -1 : 1,
    1
  );

  ctx.filter = `
    brightness(${settings.brightness}%)
    contrast(${settings.contrast}%)
    saturate(${settings.saturation}%)
  `;

  ctx.drawImage(
    originalImage,
    -originalImage.width / 2,
    -originalImage.height / 2
  );

  ctx.restore();

  // Warmth overlay

  if (settings.warmth !== 0) {
    ctx.save();

    ctx.globalCompositeOperation = "soft-light";

    ctx.fillStyle = settings.warmth > 0
      ? `rgba(255, 130, 30, ${Math.abs(settings.warmth) / 350})`
      : `rgba(50, 140, 255, ${Math.abs(settings.warmth) / 350})`;

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  }
}


// UPDATE CONTROLS

function updateControls() {
  Object.keys(photoSettings).forEach(key => {
    const input = document.getElementById(key);

    const value = photoSettings[key];

    input.value = value;

    const display = document.getElementById(
      key + "Value"
    );

    display.textContent =
      key === "warmth"
        ? value
        : value + "%";
  });
}


// SLIDERS

["brightness", "contrast", "saturation", "warmth"]
.forEach(key => {

  const input = document.getElementById(key);

  input.addEventListener("input", () => {

    photoSettings[key] = Number(input.value);

    document.getElementById(
      key + "Value"
    ).textContent =
      key === "warmth"
        ? input.value
        : input.value + "%";

    renderPhoto();

  });

});


// FILTER BUTTONS

document.querySelectorAll(".filter-btn").forEach(button => {

  button.addEventListener("click", () => {

    document.querySelectorAll(".filter-btn").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    selectedFilter = button.dataset.filter;

    renderPhoto();

  });

});


// ROTATE

function rotatePhoto() {
  if (!originalImage) {
    alert("Upload an image first.");
    return;
  }

  rotation = (rotation + 90) % 360;

  renderPhoto();
}


// FLIP

function flipPhoto() {
  if (!originalImage) {
    alert("Upload an image first.");
    return;
  }

  flipped = !flipped;

  renderPhoto();
}


// RESET

function resetPhoto() {
  if (!originalImage) {
    alert("Upload an image first.");
    return;
  }

  rotation = 0;
  flipped = false;
  selectedFilter = "original";

  photoSettings = { ...defaultSettings };

  document.querySelectorAll(".filter-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filter === "original"
    );
  });

  updateControls();

  renderPhoto();
}


// EXPORT

function exportPhoto() {
  if (!originalImage) {
    alert("Upload an image first.");
    return;
  }

  const link = document.createElement("a");

  link.download = "vyrox-edited-image.png";

  link.href = canvas.toDataURL("image/png");

  link.click();
}


// ===================================
// VIDEO EDITOR
// ===================================

const videoPlayer = document.getElementById("videoPlayer");

const videoUpload = document.getElementById("videoUpload");

const videoPlaceholder = document.getElementById(
  "videoPlaceholder"
);

videoUpload.addEventListener("change", event => {

  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("video/")) {
    alert("Please select a valid video.");
    return;
  }

  videoPlayer.src = URL.createObjectURL(file);

  videoPlayer.hidden = false;

  videoPlaceholder.hidden = true;

});


// AUDIO UPLOAD

const audioPlayer = document.getElementById("audioPlayer");

const audioUpload = document.getElementById("audioUpload");

audioUpload.addEventListener("change", event => {

  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("audio/")) {
    alert("Please select a valid audio file.");
    return;
  }

  audioPlayer.src = URL.createObjectURL(file);

  audioPlayer.load();

});


// ===================================
// AI ASSISTANT
// ===================================

const chatForm = document.getElementById("chatForm");

const chatInput = document.getElementById("chatInput");

const chatMessages = document.getElementById("chatMessages");

function addMessage(message, type) {

  const element = document.createElement("div");

  element.className = "message " + type;

  element.textContent = message;

  chatMessages.appendChild(element);

  chatMessages.scrollTop = chatMessages.scrollHeight;

  return element;
}


chatForm.addEventListener("submit", async event => {

  event.preventDefault();

  const message = chatInput.value.trim();

  if (!message) return;

  addMessage(message, "user-message");

  chatInput.value = "";

  const loading = addMessage(
    "VYROX AI is thinking...",
    "ai-message"
  );

  const sendButton = chatForm.querySelector("button");

  sendButton.disabled = true;

  try {

    const response = await fetch("/api/ai/assist", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message
      })

    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI request failed.");
    }

    loading.textContent = data.reply;

  } catch (error) {

    loading.textContent =
      "Connection error: " + error.message;

  } finally {

    sendButton.disabled = false;

  }

});


// ===================================
// CHECK AI STATUS
// ===================================

async function checkAIStatus() {

  const status = document.getElementById("aiStatus");

  try {

    const response = await fetch("/api/ai/status");

    const data = await response.json();

    status.textContent = data.configured
      ? "AI API connected"
      : "AI API key not configured";

  } catch {

    status.textContent = "Server connection unavailable";

  }

}

checkAIStatus();


// ===================================
// APPLICATION READY
// ===================================

console.log("VYROX STUDIO initialized.");

console.log("Developer: Rishikesh Singh");
