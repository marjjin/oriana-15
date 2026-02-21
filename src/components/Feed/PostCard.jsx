import "./postCard.css";
import { LikeButton } from "../likes";
import { CommentsSection } from "../comments";

function isVideoUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  const cleanUrl = url.split("?")[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(cleanUrl);
}

function PostCard({
  post,
  formattedDate,
  onToggleLike,
  likePending,
  comments,
  commentCount,
  currentUserId,
  commentsOpen,
  commentsLoading,
  commentSubmitting,
  deletingByCommentId,
  onToggleComments,
  onAddComment,
  onDeleteComment,
  onOpenProfile,
}) {
  const avatarFallback = (post.user_name || "U").trim().charAt(0).toUpperCase() || "U";
  const hasVideo = isVideoUrl(post.foto_url);

  return (
    <article className="oriana-feed__post" key={post.id}>
      <header className="oriana-feed__post-header">
        <button
          type="button"
          className="oriana-feed__post-author"
          onClick={() => onOpenProfile(post.user_id)}
        >
        <div className="oriana-feed__post-avatar-wrap" aria-hidden="true">
          {post.user_avatar_url ? (
            <img
              className="oriana-feed__post-avatar"
              src={post.user_avatar_url}
              alt={`Avatar de ${post.user_name}`}
            />
          ) : (
            <span className="oriana-feed__post-avatar-fallback">{avatarFallback}</span>
          )}
        </div>
        <span className="oriana-feed__post-user">@{post.user_name}</span>
      </button>
        <span className="oriana-feed__post-date">{formattedDate}</span>
      </header>

      {hasVideo ? (
        <video
          className="oriana-feed__post-image"
          src={post.foto_url}
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          className="oriana-feed__post-image"
          src={post.foto_url}
          alt={`Publicación de ${post.user_name}`}
          loading="lazy"
        />
      )}

      <div className="oriana-feed__post-actions">
        <LikeButton
          liked={Boolean(post.likedByCurrentUser)}
          count={post.likeCount || 0}
          pending={likePending}
          onToggle={() => onToggleLike(post.id)}
        />

        <CommentsSection
          postId={post.id}
          comments={comments}
          commentCount={commentCount}
          currentUserId={currentUserId}
          open={commentsOpen}
          loading={commentsLoading}
          submitting={commentSubmitting}
          deletingByCommentId={deletingByCommentId}
          onToggle={onToggleComments}
          onSubmitComment={onAddComment}
          onDeleteComment={onDeleteComment}
          onOpenProfile={onOpenProfile}
        />
      </div>

      {post.descripcion && <p className="oriana-feed__post-caption">{post.descripcion}</p>}
    </article>
  );
}

export default PostCard;