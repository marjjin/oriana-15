import { CameraIcon } from "../icons";

function UploadFabButton({ onClick }) {
  return (
    <button
      type="button"
      className="oriana-upload__fab"
      onClick={onClick}
      aria-label="Crear publicación"
    >
      <span className="oriana-upload__icon oriana-upload__icon--fab">
        <CameraIcon />
      </span>
    </button>
  );
}

export default UploadFabButton;
