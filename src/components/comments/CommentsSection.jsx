import { useEffect, useState } from "react";
import "./comments.css";

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5.6 6.2h12.8a2.4 2.4 0 0 1 2.4 2.4v7.4a2.4 2.4 0 0 1-2.4 2.4H9.9l-3.7 2.9a.6.6 0 0 1-.96-.47v-2.43A2.4 2.4 0 0 1 3.2 16V8.6a2.4 2.4 0 0 1 2.4-2.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatCommentDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CommentsSection({
  postId,
  comments,
  commentCount,
  currentUserId,
  open,
  loading,
  submitting,
  deletingByCommentId,
  onToggle,
  onSubmitComment,
  onDeleteComment,
  onOpenProfile,
}) {
  const [draft, setDraft] = useState("");
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const success = await onSubmitComment({ postId, text: draft });
    if (success) {
      setDraft("");
    }
  };

  const totalComments = open ? comments.length : commentCount;
  const commentsLabel = `${totalComments}`;
  const isDeletingSelectedComment =
    confirmDeleteCommentId !== null && Boolean(deletingByCommentId?.[confirmDeleteCommentId]);

  useEffect(() => {
    if (!open && confirmDeleteCommentId === null) {
      return undefined;
    }

    document.body.classList.add("oriana-comments-modal-open");

    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const onPopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.body.classList.remove("oriana-comments-modal-open");
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
    };
  }, [confirmDeleteCommentId, open]);

  const handleDeleteComment = async (commentId) => {
    const success = await onDeleteComment({ postId, commentId });
    if (success) {
      setConfirmDeleteCommentId(null);
    }
  };

  return (
    <div className="oriana-comments">
      <button
        type="button"
        className="oriana-comments__trigger"
        onClick={() => onToggle(postId)}
        aria-expanded={open}
        aria-label="Ver comentarios"
      >
        <span className="oriana-comments__trigger-icon">
          <CommentIcon />
        </span>
      </button>
      <span className="oriana-comments__trigger-count">{commentsLabel}</span>

      {open && (
        <div className="oriana-comments__sheet-backdrop" onClick={() => onToggle(postId)}>
          <section className="oriana-comments__sheet" onClick={(event) => event.stopPropagation()}>
            <div className="oriana-comments__sheet-header">
              <h4 className="oriana-comments__sheet-title">Comentarios</h4>
              <button
                type="button"
                className="oriana-comments__sheet-close"
                aria-label="Cerrar comentarios"
                onClick={() => onToggle(postId)}
              >
                ✕
              </button>
            </div>

            <p className="oriana-comments__sheet-subtitle">{commentsLabel}</p>

            <div className="oriana-comments__sheet-body">
              {loading && <p className="oriana-comments__state">Cargando comentarios...</p>}

              {!loading && comments.length === 0 && (
                <p className="oriana-comments__state">Sé la primera persona en comentar.</p>
              )}

              {!loading && comments.length > 0 && (
                <ul className="oriana-comments__list">
                  {comments.map((comment) => (
                    <li className="oriana-comments__item" key={comment.id}>
                      <div className="oriana-comments__meta">
                          <button
                            type="button"
                            className="oriana-comments__user"
                            onClick={() => onOpenProfile?.(comment.userId)}
                          >
                            @{comment.userName}
                          </button>
                        <div className="oriana-comments__meta-actions">
                          <span className="oriana-comments__date">{formatCommentDate(comment.createdAt)}</span>
                          {String(comment.userId) === String(currentUserId) && (
                            <button
                              type="button"
                              className="oriana-comments__delete"
                              disabled={Boolean(deletingByCommentId?.[comment.id])}
                              onClick={() => setConfirmDeleteCommentId(comment.id)}
                            >
                              {deletingByCommentId?.[comment.id] ? "Borrando..." : "Eliminar"}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="oriana-comments__text">{comment.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form className="oriana-comments__form" onSubmit={handleSubmit}>
              <input
                className="oriana-comments__input"
                type="text"
                placeholder="Agregá un comentario..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={280}
              />
              <button
                type="submit"
                className="oriana-comments__submit"
                disabled={submitting || !draft.trim()}
              >
                {submitting ? "Enviando..." : "Publicar"}
              </button>
            </form>
          </section>
        </div>
      )}

      {confirmDeleteCommentId !== null && (
        <div
          className="oriana-comments__modal-backdrop"
          onClick={() => {
            if (!isDeletingSelectedComment) {
              setConfirmDeleteCommentId(null);
            }
          }}
        >
          <div className="oriana-comments__modal" onClick={(event) => event.stopPropagation()}>
            <h4 className="oriana-comments__modal-title">Confirmar eliminación</h4>
            <p className="oriana-comments__modal-text">
              ¿Querés borrar este comentario? Esta acción no se puede deshacer.
            </p>
            <div className="oriana-comments__modal-actions">
              <button
                type="button"
                className="oriana-comments__modal-btn oriana-comments__modal-btn--danger"
                disabled={isDeletingSelectedComment}
                onClick={() => handleDeleteComment(confirmDeleteCommentId)}
              >
                {isDeletingSelectedComment ? "Borrando..." : "Sí, borrar"}
              </button>
              <button
                type="button"
                className="oriana-comments__modal-btn oriana-comments__modal-btn--ghost"
                disabled={isDeletingSelectedComment}
                onClick={() => setConfirmDeleteCommentId(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentsSection;
