import { useLiveScreenMedia } from "./useLiveScreenMedia";
import "./liveScreen.css";

function LiveScreen() {
  const {
    currentIsVideo,
    currentMediaKey,
    currentMediaUrl,
    currentPhoto,
    error,
    loading,
    mediaItems,
    safeIndex,
    shouldShowIntro,
  } = useLiveScreenMedia();

  return (
    <section className="oriana-live-screen" aria-live="polite">
      {shouldShowIntro && (
        <div className="oriana-live-screen__intro">
          <img className="oriana-live-screen__intro-qr" src="/oriana-qr.png" alt="QR para subir fotos" />
          <p className="oriana-live-screen__intro-text">Compartí tus mejores momentos acá ✨</p>
        </div>
      )}

      {loading && <p className="oriana-live-screen__state">Cargando fotos...</p>}

      {!loading && error && <p className="oriana-live-screen__state oriana-live-screen__state--error">{error}</p>}

      {!shouldShowIntro && !loading && !error && !currentPhoto && (
        <p className="oriana-live-screen__state">Todavía no hay publicaciones para mostrar.</p>
      )}

      {!loading && !error && currentPhoto && (
        <div className="oriana-live-screen__frame">
          {!currentIsVideo && (
            <img
              key={`backdrop-${currentMediaKey}`}
              className="oriana-live-screen__backdrop"
              src={currentMediaUrl}
              alt=""
              aria-hidden="true"
            />
          )}

          {currentIsVideo ? (
            <video
              key={`video-${currentMediaKey}`}
              className="oriana-live-screen__photo"
              src={currentMediaUrl}
              autoPlay
              muted
              playsInline
              loop
              preload="metadata"
            />
          ) : (
            <img
              key={`photo-${currentMediaKey}`}
              className="oriana-live-screen__photo"
              src={currentMediaUrl}
              alt="Foto del feed"
              loading="eager"
              decoding="async"
            />
          )}

          <img className="oriana-live-screen__slide-qr" src="/oriana-qr.png" alt="QR para subir fotos" />

          <div className="oriana-live-screen__meta">
            <span>
              {safeIndex + 1} / {mediaItems.length}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default LiveScreen;
