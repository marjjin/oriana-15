import { useEffect, useMemo, useRef, useState } from "react";
import "./uploadModal.css";

const CAPTION_MAX_LENGTH = 2200;
const DEFAULT_ADJUSTMENTS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

const ADJUSTMENT_LABELS = {
  brightness: "Brillo",
  contrast: "Contraste",
  saturation: "Saturación",
};

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M8 7.5h1.2l1-1.6a1.5 1.5 0 0 1 1.28-.72h1.04c.52 0 1 .27 1.28.72l1 1.6H16a3 3 0 0 1 3 3v6.5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V10.5a3 3 0 0 1 3-3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="13.5"
        r="3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect
        x="4.5"
        y="5.5"
        width="15"
        height="13"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="9" cy="10" r="1.3" fill="currentColor" />
      <path
        d="m7.3 16.5 3.5-3.5a1.3 1.3 0 0 1 1.84 0l1 1 1.15-1.15a1.3 1.3 0 0 1 1.84 0l1.87 1.87"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M7 8.5H3.8V5.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.2 8.5a8 8 0 1 1 2.3 9.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlipIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 5v14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M11.2 18H6.6a1.6 1.6 0 0 1-1.6-1.6V7.6A1.6 1.6 0 0 1 6.6 6h4.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12.8 18h4.6a1.6 1.6 0 0 0 1.6-1.6V7.6A1.6 1.6 0 0 0 17.4 6h-4.6Z"
        fill="currentColor"
        opacity="0.2"
      />
    </svg>
  );
}

function BrightnessIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle
        cx="12"
        cy="12"
        r="3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.9 5.9l1.5 1.5M16.6 16.6l1.5 1.5M18.1 5.9l-1.5 1.5M7.4 16.6l-1.5 1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ContrastIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle
        cx="12"
        cy="12"
        r="7.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 4.7a7.3 7.3 0 0 1 0 14.6Z"
        fill="currentColor"
        opacity="0.24"
      />
    </svg>
  );
}

function SaturationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 4.5c2.4 3 5.8 6.5 5.8 9.4a5.8 5.8 0 1 1-11.6 0c0-2.9 3.4-6.4 5.8-9.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 7.4v12.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function normalizeRotation(rotation) {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function buildFilter({ brightness, contrast, saturation }) {
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
}

async function prepareImageFile(file, rotation, flipHorizontal, adjustments) {
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

    // Si la descripción está vacía, usar 'sin descripcion'
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
              <div className="oriana-upload__actions">
                <button
                  type="button"
                  className="oriana-upload__pick"
                  aria-label="Sacar foto"
                  title="Sacar foto"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <span className="oriana-upload__icon">
                    <CameraIcon />
                  </span>
                  <span className="oriana-upload__pick-label">Cámara</span>
                </button>

                <button
                  type="button"
                  className="oriana-upload__pick"
                  aria-label="Subir de galería"
                  title="Subir de galería"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <span className="oriana-upload__icon">
                    <GalleryIcon />
                  </span>
                  <span className="oriana-upload__pick-label">Galería</span>
                </button>
              </div>
            )}

            <p className="oriana-upload__filename">
              {selectedFile
                ? selectedFile.name
                : "Todavía no elegiste una imagen"}
            </p>

            {selectedFile && (
              <>
                <div className="oriana-upload__preview-wrap">
                  <button
                    type="button"
                    className="oriana-upload__remove"
                    onClick={handleRemoveSelectedFile}
                    aria-label="Quitar foto seleccionada"
                  >
                    ✕
                  </button>

                  <img
                    className="oriana-upload__preview"
                    src={previewUrl}
                    alt="Vista previa"
                    style={{
                      transform: `rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1})`,
                      filter: buildFilter(adjustments),
                    }}
                  />
                </div>

                <p className="oriana-upload__hint">
                  Recorte automático: 4:5 suave al publicar.
                </p>

                <div className="oriana-upload__tools">
                  <button
                    type="button"
                    className="oriana-upload__edit"
                    aria-label="Rotar foto"
                    title="Rotar foto"
                    onClick={() => setRotation((prev) => prev + 90)}
                  >
                    <span className="oriana-upload__icon oriana-upload__icon--tool">
                      <RotateIcon />
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`oriana-upload__edit ${flipHorizontal ? "oriana-upload__edit--active" : ""}`}
                    title="Invertir horizontal"
                    aria-pressed={flipHorizontal}
                    aria-label="Invertir horizontal"
                    onClick={() => setFlipHorizontal((prev) => !prev)}
                  >
                    <span className="oriana-upload__icon oriana-upload__icon--tool">
                      <FlipIcon />
                    </span>
                  </button>
                </div>

                <div className="oriana-upload__filter-tools">
                  <button
                    type="button"
                    className={`oriana-upload__edit oriana-upload__edit--filter ${selectedAdjustment === "brightness" ? "oriana-upload__edit--active" : ""}`}
                    title="Brillo"
                    aria-pressed={selectedAdjustment === "brightness"}
                    aria-label="Ajustar brillo"
                    onClick={() =>
                      setSelectedAdjustment((prev) =>
                        prev === "brightness" ? null : "brightness",
                      )
                    }
                  >
                    <span className="oriana-upload__icon oriana-upload__icon--tool">
                      <BrightnessIcon />
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`oriana-upload__edit oriana-upload__edit--filter ${selectedAdjustment === "contrast" ? "oriana-upload__edit--active" : ""}`}
                    title="Contraste"
                    aria-pressed={selectedAdjustment === "contrast"}
                    aria-label="Ajustar contraste"
                    onClick={() =>
                      setSelectedAdjustment((prev) =>
                        prev === "contrast" ? null : "contrast",
                      )
                    }
                  >
                    <span className="oriana-upload__icon oriana-upload__icon--tool">
                      <ContrastIcon />
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`oriana-upload__edit oriana-upload__edit--filter ${selectedAdjustment === "saturation" ? "oriana-upload__edit--active" : ""}`}
                    title="Saturación"
                    aria-pressed={selectedAdjustment === "saturation"}
                    aria-label="Ajustar saturación"
                    onClick={() =>
                      setSelectedAdjustment((prev) =>
                        prev === "saturation" ? null : "saturation",
                      )
                    }
                  >
                    <span className="oriana-upload__icon oriana-upload__icon--tool">
                      <SaturationIcon />
                    </span>
                  </button>
                </div>

                {selectedAdjustment && (
                  <div className="oriana-upload__adjustments">
                    <div className="oriana-upload__adjust-row">
                      <label htmlFor="adjust_active">
                        {ADJUSTMENT_LABELS[selectedAdjustment]}
                      </label>
                      <span>{adjustments[selectedAdjustment]}%</span>
                    </div>

                    <input
                      id="adjust_active"
                      type="range"
                      min="50"
                      max="150"
                      value={adjustments[selectedAdjustment]}
                      onChange={(event) =>
                        setAdjustments((prev) => ({
                          ...prev,
                          [selectedAdjustment]: Number(event.target.value),
                        }))
                      }
                    />

                    <button
                      type="button"
                      className="oriana-upload__reset-adjust"
                      onClick={() => {
                        setAdjustments(DEFAULT_ADJUSTMENTS);
                        setSelectedAdjustment(null);
                      }}
                    >
                      Restablecer ajustes
                    </button>
                  </div>
                )}
              </>
            )}

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

      {!isOpen && (
        <button
          type="button"
          className="oriana-upload__fab"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Crear publicación"
        >
          <span className="oriana-upload__icon oriana-upload__icon--fab">
            <CameraIcon />
          </span>
        </button>
      )}
    </>
  );
}

export default UploadModal;
