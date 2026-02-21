import ImageEditorSection from "./ImageEditorSection";

function SelectedMediaSection({
  selectedFile,
  isImageFile,
  isVideoFile,
  previewUrl,
  rotation,
  flipHorizontal,
  adjustments,
  selectedAdjustment,
  onRemoveSelectedFile,
  onRotate,
  onToggleFlip,
  onToggleAdjustment,
  onAdjustmentChange,
  onResetAdjustments,
  maxVideoDurationSeconds,
}) {
  if (!selectedFile) {
    return null;
  }

  if (isImageFile) {
    return (
      <ImageEditorSection
        selectedFile={selectedFile}
        previewUrl={previewUrl}
        rotation={rotation}
        flipHorizontal={flipHorizontal}
        adjustments={adjustments}
        selectedAdjustment={selectedAdjustment}
        onRemoveSelectedFile={onRemoveSelectedFile}
        onRotate={onRotate}
        onToggleFlip={onToggleFlip}
        onToggleAdjustment={onToggleAdjustment}
        onAdjustmentChange={onAdjustmentChange}
        onResetAdjustments={onResetAdjustments}
      />
    );
  }

  if (!isVideoFile) {
    return null;
  }

  return (
    <>
      <div className="oriana-upload__preview-wrap">
        <button
          type="button"
          className="oriana-upload__remove"
          onClick={onRemoveSelectedFile}
          aria-label="Quitar video seleccionado"
        >
          ✕
        </button>

        <video
          className="oriana-upload__preview"
          src={previewUrl}
          controls
          playsInline
          preload="metadata"
        />
      </div>

      <p className="oriana-upload__hint">
        Duración máxima de video: {maxVideoDurationSeconds} segundos.
      </p>
    </>
  );
}

export default SelectedMediaSection;
