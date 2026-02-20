export function normalizeRotation(rotation) {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function buildFilter({ brightness, contrast, saturation }) {
  const brightnessPercent = 100 + brightness;
  const contrastPercent = 100 + contrast;
  const saturationPercent = 100 + saturation;

  return `brightness(${brightnessPercent}%) contrast(${contrastPercent}%) saturate(${saturationPercent}%)`;
}

export async function prepareImageFile(file, rotation, flipHorizontal, adjustments) {
  const normalizedRotation = normalizeRotation(rotation);

  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const rotationCanvas = document.createElement("canvas");
      const rotationContext = rotationCanvas.getContext("2d");

      if (!rotationContext) {
        URL.revokeObjectURL(imageUrl);
        reject(new Error("No se pudo procesar la imagen."));
        return;
      }

      const swapSides = normalizedRotation === 90 || normalizedRotation === 270;
      rotationCanvas.width = swapSides ? image.height : image.width;
      rotationCanvas.height = swapSides ? image.width : image.height;

      rotationContext.translate(
        rotationCanvas.width / 2,
        rotationCanvas.height / 2,
      );
      rotationContext.rotate((normalizedRotation * Math.PI) / 180);
      if (flipHorizontal) {
        rotationContext.scale(-1, 1);
      }
      rotationContext.drawImage(image, -image.width / 2, -image.height / 2);

      const cropInset = 0.05;
      let sourceX = rotationCanvas.width * cropInset;
      let sourceY = rotationCanvas.height * cropInset;
      let sourceWidth = rotationCanvas.width - sourceX * 2;
      let sourceHeight = rotationCanvas.height - sourceY * 2;

      const targetRatio = 4 / 5;
      const currentRatio = sourceWidth / sourceHeight;

      if (currentRatio > targetRatio) {
        const adjustedWidth = sourceHeight * targetRatio;
        sourceX += (sourceWidth - adjustedWidth) / 2;
        sourceWidth = adjustedWidth;
      } else {
        const adjustedHeight = sourceWidth / targetRatio;
        sourceY += (sourceHeight - adjustedHeight) / 2;
        sourceHeight = adjustedHeight;
      }

      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = Math.max(1, Math.round(sourceWidth));
      outputCanvas.height = Math.max(1, Math.round(sourceHeight));
      const outputContext = outputCanvas.getContext("2d");

      if (!outputContext) {
        URL.revokeObjectURL(imageUrl);
        reject(new Error("No se pudo procesar el recorte de la imagen."));
        return;
      }

      outputContext.filter = buildFilter(adjustments);
      outputContext.drawImage(
        rotationCanvas,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputCanvas.width,
        outputCanvas.height,
      );

      outputCanvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(imageUrl);
          if (!blob) {
            reject(new Error("No se pudo generar la imagen editada."));
            return;
          }

          const fileEdited = new File([blob], file.name, {
            type: blob.type || file.type || "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(fileEdited);
        },
        file.type || "image/jpeg",
        0.92,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("No se pudo leer la imagen seleccionada."));
    };

    image.src = imageUrl;
  });
}
