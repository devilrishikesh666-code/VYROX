
/* VIDEO WORKSPACE */

const videoInput = document.createElement("input");

videoInput.type = "file";
videoInput.accept = "video/mp4,video/webm,video/quicktime";
videoInput.hidden = true;

document.body.append(videoInput);

let activeVideoURL = null;
let videoElement = null;

const videoButton = document.createElement("button");

videoButton.textContent = "Open Video";
videoButton.className = "control-button";

document.querySelector(".advanced-toolbar").append(videoButton);

videoButton.addEventListener("click", () => {
    videoInput.click();
});

videoInput.addEventListener("change", event => {
    const file = event.target.files[0];

    if (!file || !file.type.startsWith("video/")) {
        updateStatus("Select a valid video");
        return;
    }

    if (activeVideoURL) {
        URL.revokeObjectURL(activeVideoURL);
    }

    activeVideoURL = URL.createObjectURL(file);

    if (videoElement) {
        videoElement.remove();
    }

    videoElement = document.createElement("video");

    videoElement.src = activeVideoURL;
    videoElement.controls = true;
    videoElement.playsInline = true;
    videoElement.preload = "metadata";
    videoElement.className = "media-preview";

    const preview = document.querySelector(".preview");

    previewImage.hidden = true;
    emptyState.style.display = "none";

    preview.append(videoElement);

    updateStatus("Video loaded");
    createVideoControls();
});

function createVideoControls() {
    const oldControls = document.querySelector(".video-controls");

    if (oldControls) oldControls.remove();

    const controls = document.createElement("div");
    controls.className = "media-controls video-controls";

    const play = document.createElement("button");
    play.textContent = "Play";

    play.addEventListener("click", async () => {
        if (videoElement.paused) {
            try {
                await videoElement.play();
                play.textContent = "Pause";
            } catch {
                updateStatus("Playback could not start");
            }
        } else {
            videoElement.pause();
            play.textContent = "Play";
        }
    });

    const restart = document.createElement("button");
    restart.textContent = "Restart";

    restart.addEventListener("click", () => {
        videoElement.currentTime = 0;
        videoElement.pause();
        play.textContent = "Play";
    });

    const mute = document.createElement("button");
    mute.textContent = "Mute";

    mute.addEventListener("click", () => {
        videoElement.muted = !videoElement.muted;
        mute.textContent = videoElement.muted ? "Unmute" : "Mute";
    });

    controls.append(play, restart, mute);

    document.querySelector(".editor-area").append(controls);

    videoElement.addEventListener("ended", () => {
        play.textContent = "Play";
    });

    videoElement.addEventListener("pause", () => {
        play.textContent = "Play";
    });

    videoElement.addEventListener("play", () => {
        play.textContent = "Pause";
    });
}

window.addEventListener("beforeunload", () => {
    if (activeVideoURL) {
        URL.revokeObjectURL(activeVideoURL);
    }
});
