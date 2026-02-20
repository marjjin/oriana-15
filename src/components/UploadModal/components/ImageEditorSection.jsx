import {
  BrightnessIcon,
  ContrastIcon,
  FlipIcon,
  RotateIcon,
  SaturationIcon,
} from "../icons";
import { ADJUSTMENT_LABELS, DEFAULT_ADJUSTMENTS } from "../constants";
import { buildFilter } from "../utils";

function ImageEditorSection({
  selectedFile,
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
}) {
  if (!selectedFile) {
    return null;
  }

  const selectedValue = adjustments[selectedAdjustment] ?? 0;
  const selectedValueLabel = `${selectedValue > 0 ? `+${selectedValue}` : selectedValue}%`;

  return (
    <>
      <div className="oriana-upload__preview-wrap">
        <button
          type="button"
          className="oriana-upload__remove"
          onClick={onRemoveSelectedFile}
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

      <p className="oriana-upload__hint">Recorte automático: 4:5 suave al publicar.</p>

      <div className="oriana-upload__tools">
        <button
          type="button"
          className="oriana-upload__edit"
          aria-label="Rotar foto"
          title="Rotar foto"
          onClick={onRotate}
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
          onClick={onToggleFlip}
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
          onClick={() => onToggleAdjustment("brightness")}
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
          onClick={() => onToggleAdjustment("contrast")}
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
          onClick={() => onToggleAdjustment("saturation")}
        >
          <span className="oriana-upload__icon oriana-upload__icon--tool">
            <SaturationIcon />
          </span>
        </button>
      </div>

      {selectedAdjustment && (
        <div className="oriana-upload__adjustments">
          <div className="oriana-upload__adjust-row">
            <label htmlFor="adjust_active">{ADJUSTMENT_LABELS[selectedAdjustment]}</label>
            <span>{selectedValueLabel}</span>
          </div>

          <input
            id="adjust_active"
            type="range"
            min="-50"
            max="50"
            value={selectedValue}
            onChange={(event) => onAdjustmentChange(Number(event.target.value))}
          />

          <button
            type="button"
            className="oriana-upload__reset-adjust"
            onClick={onResetAdjustments}
            disabled={
              adjustments.brightness === DEFAULT_ADJUSTMENTS.brightness &&
              adjustments.contrast === DEFAULT_ADJUSTMENTS.contrast &&
              adjustments.saturation === DEFAULT_ADJUSTMENTS.saturation
            }
          >
            Restablecer ajustes
          </button>
        </div>
      )}
    </>
  );
}

export default ImageEditorSection;
