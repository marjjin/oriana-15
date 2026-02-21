function getRecorderMimeType() {
  if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];

  return candidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || "";
}

export async function compressVideoFile(inputFile, options = {}) {
  const {
    targetBitrate = 4_500_000,
    minSizeToCompressBytes = 10 * 1024 * 1024,
    onProgress,
  } = options;

  if (!inputFile?.type?.startsWith("video/")) {
    return { file: inputFile, compressed: false };
  }

  if (inputFile.size < minSizeToCompressBytes) {
    return { file: inputFile, compressed: false };
  }

  if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
    return { file: inputFile, compressed: false };
  }

  const mimeType = getRecorderMimeType();
  if (!mimeType) {
    return { file: inputFile, compressed: false };
  }

  const objectUrl = URL.createObjectURL(inputFile);
  const video = document.createElement("video");
  video.src = objectUrl;
  video.preload = "metadata";
  video.playsInline = true;
  video.muted = true;

  try {
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("No se pudo leer el video para comprimir."));
    });

    const durationSeconds = Number(video.duration);
    const sourceAverageBitrate =
      Number.isFinite(durationSeconds) && durationSeconds > 0
        ? (inputFile.size * 8) / durationSeconds
        : targetBitrate;
    const adaptiveBitrate = Math.max(
      3_500_000,
      Math.min(10_000_000, Math.min(targetBitrate, sourceAverageBitrate * 0.9)),
    );

    const baseStream = video.captureStream?.();
    const detectedFrameRate = Number(baseStream?.getVideoTracks?.()[0]?.getSettings?.().frameRate);
    baseStream?.getTracks?.().forEach((track) => track.stop());

    const stream =
      Number.isFinite(detectedFrameRate) && detectedFrameRate > 0
        ? video.captureStream?.(detectedFrameRate)
        : video.captureStream?.();

    if (!stream) {
      return { file: inputFile, compressed: false };
    }

    const chunks = [];
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: adaptiveBitrate,
    });

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    onProgress?.(5);

    const progressHandler = () => {
      const duration = Number(video.duration);
      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }

      const ratio = Math.min(1, Math.max(0, video.currentTime / duration));
      onProgress?.(5 + ratio * 90);
    };

    video.addEventListener("timeupdate", progressHandler);

    await new Promise((resolve, reject) => {
      recorder.onerror = () => reject(new Error("No se pudo comprimir el video."));
      recorder.onstop = () => resolve();

      video.onended = () => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      };

      recorder.start(250);
      video
        .play()
        .then(() => undefined)
        .catch(() => reject(new Error("No se pudo reproducir el video para comprimir.")));
    });

    video.removeEventListener("timeupdate", progressHandler);

    const blob = new Blob(chunks, { type: recorder.mimeType || mimeType });
    if (!blob.size) {
      return { file: inputFile, compressed: false };
    }

    const extension = blob.type.includes("mp4") ? "mp4" : "webm";
    const compressedFile = new File([blob], `compressed-${Date.now()}.${extension}`, {
      type: blob.type || inputFile.type,
      lastModified: Date.now(),
    });

    onProgress?.(100);

    if (compressedFile.size >= inputFile.size * 0.95) {
      return { file: inputFile, compressed: false };
    }

    return { file: compressedFile, compressed: true };
  } finally {
    URL.revokeObjectURL(objectUrl);
    video.removeAttribute("src");
    video.load();
  }
}
