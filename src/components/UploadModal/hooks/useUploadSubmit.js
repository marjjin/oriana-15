import { useCallback, useState } from "react";
import { MAX_UPLOAD_FILE_SIZE_MB, MAX_VIDEO_DURATION_SECONDS } from "../constants";
import { getVideoDurationInSeconds, prepareImageFile } from "../utils";

function useUploadSubmit({
  selectedFile,
  caption,
  isVideoFile,
  rotation,
  flipHorizontal,
  adjustments,
  setLocalError,
  onSubmit,
  closeModal,
}) {
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitActive, setSubmitActive] = useState(false);
  const [uploadTotalBytes, setUploadTotalBytes] = useState(0);
  const [uploadTransferredBytes, setUploadTransferredBytes] = useState(0);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!selectedFile) {
        setLocalError("Primero elegí una imagen o un video desde cámara o galería.");
        return;
      }

      const maxUploadSizeBytes = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024;
      if (selectedFile.size > maxUploadSizeBytes) {
        setLocalError(
          `El archivo supera el tamaño máximo de ${MAX_UPLOAD_FILE_SIZE_MB} MB. Elegí uno más liviano.`,
        );
        return;
      }

      setLocalError("");
      setSubmitActive(true);
      setSubmitProgress(5);
      setSubmitMessage("Preparando archivo...");
      setUploadTotalBytes(0);
      setUploadTransferredBytes(0);

      const captionToSend = caption.trim() === "" ? "sin descripcion" : caption;

      try {
        if (isVideoFile) {
          setSubmitMessage("Validando video...");
          const duration = await getVideoDurationInSeconds(selectedFile);
          if (duration > MAX_VIDEO_DURATION_SECONDS) {
            setLocalError(
              `El video es demasiado largo. Máximo ${MAX_VIDEO_DURATION_SECONDS} segundos.`,
            );
            setSubmitActive(false);
            setSubmitProgress(0);
            setSubmitMessage("");
            return;
          }
        }

        const finalFile = isVideoFile
          ? selectedFile
          : await prepareImageFile(
              selectedFile,
              rotation,
              flipHorizontal,
              adjustments,
            );

        setUploadTotalBytes(finalFile.size || 0);
        setUploadTransferredBytes(0);

        setSubmitMessage("Subiendo archivo...");
        setSubmitProgress((prev) => Math.max(prev, 10));

        const success = await onSubmit({
          file: finalFile,
          caption: captionToSend,
          onUploadProgress: (uploadProgress) => {
            const normalizedProgress = Math.max(0, Math.min(100, Number(uploadProgress) || 0));
            const mappedProgress = 10 + normalizedProgress * 0.9;
            setSubmitProgress((prev) => Math.max(prev, mappedProgress));
            setUploadTransferredBytes((finalFile.size || 0) * (normalizedProgress / 100));
          },
        });

        if (success) {
          setSubmitProgress(100);
          setSubmitMessage("Listo");
          setUploadTransferredBytes(finalFile.size || 0);
          setTimeout(() => {
            setSubmitActive(false);
            setSubmitProgress(0);
            setSubmitMessage("");
            setUploadTotalBytes(0);
            setUploadTransferredBytes(0);
          }, 200);
          closeModal();
          return;
        }

        setSubmitActive(false);
        setSubmitProgress(0);
        setSubmitMessage("");
        setUploadTotalBytes(0);
        setUploadTransferredBytes(0);
      } catch (submitError) {
        setLocalError(submitError.message || "No se pudo preparar el archivo.");
        setSubmitActive(false);
        setSubmitProgress(0);
        setSubmitMessage("");
        setUploadTotalBytes(0);
        setUploadTransferredBytes(0);
      }
    },
    [
      selectedFile,
      caption,
      isVideoFile,
      rotation,
      flipHorizontal,
      adjustments,
      setLocalError,
      onSubmit,
      closeModal,
    ],
  );

  return {
    handleSubmit,
    submitProgress,
    submitMessage,
    submitActive,
    uploadTotalBytes,
    uploadTransferredBytes,
  };
}

export default useUploadSubmit;
