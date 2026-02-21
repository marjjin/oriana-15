import { CameraIcon, GalleryIcon } from "../icons";

function FileSourceActions({ onCameraClick, onGalleryClick }) {
  return (
    <div className="oriana-upload__actions">
      <button
        type="button"
        className="oriana-upload__pick"
        aria-label="Sacar foto"
        title="Sacar foto"
        onClick={onCameraClick}
      >
        <span className="oriana-upload__icon">
          <CameraIcon />
        </span>
        <span className="oriana-upload__pick-label">Cámara</span>
      </button>

      <button
        type="button"
        className="oriana-upload__pick"
        aria-label="Subir foto o video de galería"
        title="Subir foto o video de galería"
        onClick={onGalleryClick}
      >
        <span className="oriana-upload__icon">
          <GalleryIcon />
        </span>
        <span className="oriana-upload__pick-label">Galería (foto/video)</span>
      </button>
    </div>
  );
}

export default FileSourceActions;
