import { useEffect } from "react";

function isVideoUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  const cleanUrl = url.split("?")[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(cleanUrl);
}

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

  const hasVideo = isVideoUrl(imageUrl);

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

        {hasVideo ? (
          <video
            className="oriana-profile-viewer__image"
            src={imageUrl}
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            className="oriana-profile-viewer__image"
            src={imageUrl}
            alt={title || "Imagen ampliada"}
          />
        )}
      </div>
    </div>
  );
}

export default ProfileImageViewer;
