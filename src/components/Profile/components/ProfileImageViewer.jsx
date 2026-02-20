import { useEffect } from "react";

function ProfileImageViewer({ open, imageUrl, title, onClose }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !imageUrl) {
    return null;
  }

  return (
    <div className="oriana-profile-viewer" onClick={onClose}>
      <div className="oriana-profile-viewer__content" onClick={(event) => event.stopPropagation()}>
        <div className="oriana-profile-viewer__header">
          <h4 className="oriana-profile-viewer__title">{title || "Vista previa"}</h4>
          <button
            type="button"
            className="oriana-profile-viewer__close"
            onClick={onClose}
            aria-label="Cerrar visor"
          >
            ✕
          </button>
        </div>

        <img className="oriana-profile-viewer__image" src={imageUrl} alt={title || "Imagen ampliada"} />
      </div>
    </div>
  );
}

export default ProfileImageViewer;
