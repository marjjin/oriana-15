export const CAPTION_MAX_LENGTH = 2200;
export const MAX_VIDEO_DURATION_SECONDS = 60;

const parsedMaxUploadSizeMb = Number(import.meta.env.VITE_MAX_UPLOAD_FILE_SIZE_MB);
export const MAX_UPLOAD_FILE_SIZE_MB =
  Number.isFinite(parsedMaxUploadSizeMb) && parsedMaxUploadSizeMb > 0
    ? parsedMaxUploadSizeMb
    : 400;

export const DEFAULT_ADJUSTMENTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
};

export const ADJUSTMENT_LABELS = {
  brightness: "Brillo",
  contrast: "Contraste",
  saturation: "Saturación",
};
