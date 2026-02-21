export function getVideoDurationInSeconds(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number(video.duration);
      cleanup();

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("No se pudo leer la duración del video."));
        return;
      }

      resolve(duration);
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("No se pudo procesar el archivo de video."));
    };

    video.src = objectUrl;
  });
}
