import { H as Hls } from "./hls-module.js";

const configElement = document.getElementById("playback-config");
const video = document.querySelector("[data-video]");
const trigger = document.querySelector("[data-play-trigger]");
let configured = false;
let hls = null;

const getSource = () => {
  if (!configElement) {
    return "";
  }

  try {
    const parsed = JSON.parse(configElement.textContent || "{}");
    return parsed.source || "";
  } catch (error) {
    return "";
  }
};

const prepareVideo = () => {
  const source = getSource();

  if (!video || !source || configured) {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
  } else if (Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(source);
    hls.attachMedia(video);
  } else {
    video.src = source;
  }

  configured = true;
};

const startPlayback = async () => {
  prepareVideo();

  if (!video) {
    return;
  }

  if (trigger) {
    trigger.classList.add("is-hidden");
  }

  try {
    await video.play();
  } catch (error) {
    if (trigger) {
      trigger.classList.remove("is-hidden");
    }
  }
};

if (trigger) {
  trigger.addEventListener("click", startPlayback);
}

if (video) {
  video.addEventListener("play", () => {
    if (trigger) {
      trigger.classList.add("is-hidden");
    }
  });

  video.addEventListener("click", () => {
    if (video.paused) {
      startPlayback();
    }
  });
}

window.addEventListener("pagehide", () => {
  if (hls) {
    hls.destroy();
    hls = null;
  }
});
