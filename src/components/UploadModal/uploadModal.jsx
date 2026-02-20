import { useEffect, useMemo, useRef, useState } from "react";
import "./uploadModal.css";
import { CAPTION_MAX_LENGTH, DEFAULT_ADJUSTMENTS } from "./constants";
import { prepareImageFile } from "./utils";
import { FileSourceActions, ImageEditorSection, UploadFabButton } from "./components";

function UploadModal({ uploading, error, onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [adjustments, setAdjustments] = useState(DEFAULT_ADJUSTMENTS);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [localError, setLocalError] = useState("");

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return "";
    }
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove("oriana-upload-open");
      return;
    }

    document.body.classList.add("oriana-upload-open");

    return () => {
      document.body.classList.remove("oriana-upload-open");
    };
  }, [isOpen]);

  const handleSelectFile = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile);
    setRotation(0);
    setFlipHorizontal(false);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSelectedAdjustment(null);
    setLocalError("");
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setRotation(0);
    setFlipHorizontal(false);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSelectedAdjustment(null);
    setLocalError("");

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setCaption("");
    setRotation(0);
    setFlipHorizontal(false);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSelectedAdjustment(null);
    setLocalError("");
  };

  const handleClose = () => {
    resetState();
    setIsOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setLocalError("Primero elegí una foto desde cámara o galería.");
      return;
    }

    setLocalError("");

    const captionToSend = caption.trim() === "" ? "sin descripcion" : caption;

    try {
      const finalFile = await prepareImageFile(
        selectedFile,
        rotation,
        flipHorizontal,
        adjustments,
      );
      const success = await onSubmit({
        file: finalFile,
        caption: captionToSend,
      });
      if (success) {
        handleClose();
      }
    } catch (submitError) {
      setLocalError(submitError.message || "No se pudo preparar la imagen.");
    }
  };

  const handleToggleAdjustment = (adjustmentKey) => {
    setSelectedAdjustment((prev) => (prev === adjustmentKey ? null : adjustmentKey));
  };

  const handleAdjustmentChange = (nextValue) => {
    if (!selectedAdjustment) {
      return;
    }

    setAdjustments((prev) => ({
      ...prev,
      [selectedAdjustment]: nextValue,
    }));
  };

  const handleResetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSelectedAdjustment(null);
  };

  return (
    <>
      {isOpen && (
        <div className="oriana-upload__layer" onClick={handleClose}>
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
                onClick={handleClose}
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
              accept="image/*"
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
                ? selectedFile.name
                : "Todavía no elegiste una imagen"}
            </p>

            <ImageEditorSection
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              rotation={rotation}
              flipHorizontal={flipHorizontal}
              adjustments={adjustments}
              selectedAdjustment={selectedAdjustment}
              onRemoveSelectedFile={handleRemoveSelectedFile}
              onRotate={() => setRotation((prev) => prev + 90)}
              onToggleFlip={() => setFlipHorizontal((prev) => !prev)}
              onToggleAdjustment={handleToggleAdjustment}
              onAdjustmentChange={handleAdjustmentChange}
              onResetAdjustments={handleResetAdjustments}
            />

            <label className="oriana-upload__label" htmlFor="upload_caption">
              Descripción (opcional)
            </label>
            <textarea
              className="oriana-upload__input oriana-upload__input--description"
              id="upload_caption"
              placeholder="Escribí algo sobre tu imagen"
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

      {!isOpen && <UploadFabButton onClick={() => setIsOpen((prev) => !prev)} />}
    </>
  );
}

export default UploadModal;
