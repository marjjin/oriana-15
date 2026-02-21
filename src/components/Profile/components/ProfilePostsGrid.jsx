function isVideoUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  const cleanUrl = url.split("?")[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(cleanUrl);
}

function ProfilePostsGrid({
  posts,
  loading,
  canDelete,
  deletingPostId,
  onOpenPostMedia,
  onDeletePost,
}) {
  if (loading) {
    return <p className="oriana-profile__state">Cargando publicaciones...</p>;
  }

  if (!posts.length) {
    return <p className="oriana-profile__state">Todavía no publicaste fotos ni videos.</p>;
  }

  return (
    <div className="oriana-profile__grid">
      {posts.map((post) => {
        const hasVideo = isVideoUrl(post.foto_url);

        return (
        <article className="oriana-profile__card" key={post.id}>
          {canDelete && (
            <button
              type="button"
              className="oriana-profile__card-delete"
              onClick={() => onDeletePost?.(post)}
              disabled={deletingPostId === post.id}
              aria-label="Eliminar publicación"
              title="Eliminar publicación"
            >
              {deletingPostId === post.id ? "..." : "✕"}
            </button>
          )}

          <button
            type="button"
            className="oriana-profile__image-button"
            onClick={() => onOpenPostMedia?.(post)}
            aria-label={hasVideo ? "Ver video ampliado" : "Ver publicación ampliada"}
          >
            {hasVideo ? (
              <>
                <video
                  className="oriana-profile__image"
                  src={post.foto_url}
                  muted
                  playsInline
                  preload="metadata"
                />
                <span className="oriana-profile__video-badge" aria-hidden="true">
                  ▶
                </span>
              </>
            ) : (
              <img
                className="oriana-profile__image"
                src={post.foto_url}
                alt="Publicación del perfil"
                loading="lazy"
              />
            )}
          </button>
        </article>
      )})}
    </div>
  );
}

export default ProfilePostsGrid;
