import "./postCard.css";

function PostCard({ post, formattedDate }) {
  return (
    <article className="oriana-feed__post" key={post.id}>
      <header className="oriana-feed__post-header">
        <span className="oriana-feed__post-user">@{post.user_name}</span>
        <span className="oriana-feed__post-date">{formattedDate}</span>
      </header>

      <img
        className="oriana-feed__post-image"
        src={post.foto_url}
        alt={`Publicación de ${post.user_name}`}
        loading="lazy"
      />

      {post.descripcion && <p className="oriana-feed__post-caption">{post.descripcion}</p>}
    </article>
  );
}

export default PostCard;