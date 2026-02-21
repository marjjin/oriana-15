import { useRef } from "react";
import "./uploadModal.css";
import {
  CAPTION_MAX_LENGTH,
  MAX_VIDEO_DURATION_SECONDS,
} from "./constants";
import { FileSourceActions, SelectedMediaSection, UploadFabButton } from "./components";
import { useUploadModalState, useUploadSubmit } from "./hooks";

function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const result = value / 1024 ** exponent;
  return `${result.toFixed(result >= 100 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function UploadModal({ uploading, error, onSubmit }) {
  const {
    isOpen,
    selectedFile,
    caption,
    rotation,
    flipHorizontal,
    adjustments,
    selectedAdjustment,
    localError,
    isVideoFile,
    isImageFile,
    previewUrl,
    setCaption,
    setRotation,
    setFlipHorizontal,
    setLocalError,
    openModal,
    closeModal,
    handleSelectFile,
    clearSelectedFileState,
    toggleAdjustment,
    changeAdjustment,
    resetAdjustments,
  } = useUploadModalState();

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleRemoveSelectedFile = () => {
    clearSelectedFileState();

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const {
    handleSubmit,
    submitProgress,
    submitMessage,
    submitActive,
    uploadTotalBytes,
    uploadTransferredBytes,
  } = useUploadSubmit({
    selectedFile,
    caption,
    isVideoFile,
    rotation,
    flipHorizontal,
    adjustments,
    setLocalError,
    onSubmit,
    closeModal,
  });

  return (
    <>
      {isOpen && (
        <div className="oriana-upload__layer" onClick={closeModal}>
          <form
            className="oriana-upload"
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="oriana-upload__header">
              <h3 className="oriana-upload__title">Nueva publicación</h3>
              <button
                type="button"
                className="oriana-upload__close"
                onClick={closeModal}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <input
              ref={cameraInputRef}
              className="oriana-upload__hidden"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleSelectFile}
            />

            <input
              ref={galleryInputRef}
              className="oriana-upload__hidden"
              type="file"
              accept="image/*,video/*"
              onChange={handleSelectFile}
            />

            {!selectedFile && (
              <FileSourceActions
                onCameraClick={() => cameraInputRef.current?.click()}
                onGalleryClick={() => galleryInputRef.current?.click()}
              />
            )}

            <p className="oriana-upload__filename">
              {selectedFile
                ? `${selectedFile.name} (${formatBytes(selectedFile.size)})`
                : "Todavía no elegiste una foto o video"}
            </p>

            <SelectedMediaSection
              selectedFile={selectedFile}
              isImageFile={isImageFile}
              isVideoFile={isVideoFile}
              previewUrl={previewUrl}
              rotation={rotation}
              flipHorizontal={flipHorizontal}
              adjustments={adjustments}
              selectedAdjustment={selectedAdjustment}
              onRemoveSelectedFile={handleRemoveSelectedFile}
              onRotate={() => setRotation((prev) => prev + 90)}
              onToggleFlip={() => setFlipHorizontal((prev) => !prev)}
              onToggleAdjustment={toggleAdjustment}
              onAdjustmentChange={changeAdjustment}
              onResetAdjustments={resetAdjustments}
              maxVideoDurationSeconds={MAX_VIDEO_DURATION_SECONDS}
            />

            <label className="oriana-upload__label" htmlFor="upload_caption">
              Descripción (opcional)
            </label>
            <textarea
              className="oriana-upload__input oriana-upload__input--description"
              id="upload_caption"
              placeholder="Escribí algo sobre tu publicación"
              value={caption}
              onChange={(event) =>
                setCaption(event.target.value.slice(0, CAPTION_MAX_LENGTH))
              }
              rows={4}
              maxLength={CAPTION_MAX_LENGTH}
            />

            <p className="oriana-upload__counter">
              {caption.length}/{CAPTION_MAX_LENGTH}
            </p>

            {submitActive && (
              <div className="oriana-upload__progress" aria-live="polite">
                <div className="oriana-upload__progress-track">
                  <div
                    className="oriana-upload__progress-fill"
                    style={{ width: `${Math.max(0, Math.min(100, submitProgress))}%` }}
                  />
                </div>
                <p className="oriana-upload__progress-text">
                  {submitMessage || "Procesando..."} {Math.round(submitProgress)}%
                </p>
                {uploadTotalBytes > 0 && (
                  <p className="oriana-upload__progress-meta">
                    {formatBytes(uploadTransferredBytes)} / {formatBytes(uploadTotalBytes)}
                  </p>
                )}
              </div>
            )}

            {localError && <p className="oriana-upload__error">{localError}</p>}
            {error && <p className="oriana-upload__error">{error}</p>}

            <button
              className="oriana-upload__submit"
              type="submit"
              disabled={uploading}
            >
              {uploading ? "Publicando..." : "Publicar"}
            </button>
          </form>
        </div>
      )}

      {!isOpen && <UploadFabButton onClick={openModal} />}
    </>
  );
}

export default UploadModal;
