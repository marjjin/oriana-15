function ProfilePostsGrid({ posts, loading, onOpenPostImage }) {
  if (loading) {
    return <p className="oriana-profile__state">Cargando publicaciones...</p>;
  }

  if (!posts.length) {
    return <p className="oriana-profile__state">Todavía no publicaste fotos.</p>;
  }

  return (
    <div className="oriana-profile__grid">
      {posts.map((post) => (
        <article className="oriana-profile__card" key={post.id}>
          <button
            type="button"
            className="oriana-profile__image-button"
            onClick={() => onOpenPostImage?.(post)}
            aria-label="Ver publicación ampliada"
          >
            <img
              className="oriana-profile__image"
              src={post.foto_url}
              alt="Publicación del perfil"
              loading="lazy"
            />
          </button>
        </article>
      ))}
    </div>
  );
}

export default ProfilePostsGrid;
