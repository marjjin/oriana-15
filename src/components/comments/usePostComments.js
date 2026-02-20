import { useCallback, useState } from "react";
import {
  createComment,
  deleteCommentById,
  fetchCommentSummaryByPostIds,
  fetchCommentsByPostId,
} from "./commentsService";

export function usePostComments(currentUserId, onError) {
  const [openByPostId, setOpenByPostId] = useState({});
  const [loadingByPostId, setLoadingByPostId] = useState({});
  const [submittingByPostId, setSubmittingByPostId] = useState({});
  const [deletingByCommentId, setDeletingByCommentId] = useState({});
  const [commentsByPostId, setCommentsByPostId] = useState({});

  const enrichPostsWithCommentCounts = useCallback(
    async (posts) => {
      const postIds = posts.map((post) => post.id).filter(Boolean);
      const { countsByPostId, missingTable, error } = await fetchCommentSummaryByPostIds(postIds);

      if (error && !missingTable) {
        onError?.("No se pudieron cargar los comentarios.");
      }

      return posts.map((post) => ({
        ...post,
        commentCount: countsByPostId[String(post.id)] || 0,
      }));
    },
    [onError],
  );

  const loadComments = useCallback(
    async (postId) => {
      setLoadingByPostId((prev) => ({ ...prev, [postId]: true }));

      const { comments, missingTable, error } = await fetchCommentsByPostId(postId);

      setLoadingByPostId((prev) => ({ ...prev, [postId]: false }));

      if (error) {
        if (!missingTable) {
          onError?.("No se pudieron cargar los comentarios.");
        }
        return;
      }

      setCommentsByPostId((prev) => ({ ...prev, [postId]: comments }));
    },
    [onError],
  );

  const toggleComments = useCallback(
    async (postId) => {
      const isOpen = Boolean(openByPostId[postId]);

      setOpenByPostId((prev) => ({
        ...prev,
        [postId]: !isOpen,
      }));

      if (!isOpen && !commentsByPostId[postId]) {
        await loadComments(postId);
      }
    },
    [commentsByPostId, loadComments, openByPostId],
  );

  const addComment = useCallback(
    async ({ postId, text }) => {
      if (!currentUserId) {
        onError?.("Necesitás iniciar sesión para comentar.");
        return false;
      }

      const trimmed = text.trim();
      if (!trimmed) {
        return false;
      }

      setSubmittingByPostId((prev) => ({ ...prev, [postId]: true }));

      const { comment, error } = await createComment({
        postId,
        userId: currentUserId,
        text: trimmed,
      });

      setSubmittingByPostId((prev) => ({ ...prev, [postId]: false }));

      if (error || !comment) {
        onError?.("No se pudo publicar el comentario.");
        return false;
      }

      setCommentsByPostId((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment],
      }));

      return true;
    },
    [currentUserId, onError],
  );

  const removeComment = useCallback(
    async ({ postId, commentId }) => {
      if (!currentUserId) {
        onError?.("Necesitás iniciar sesión para borrar comentarios.");
        return false;
      }

      const targetComment = (commentsByPostId[postId] || []).find(
        (comment) => comment.id === commentId,
      );

      if (!targetComment) {
        return false;
      }

      if (String(targetComment.userId) !== String(currentUserId)) {
        onError?.("Solo podés borrar tus propios comentarios.");
        return false;
      }

      setDeletingByCommentId((prev) => ({ ...prev, [commentId]: true }));

      const { error } = await deleteCommentById(commentId);

      setDeletingByCommentId((prev) => ({ ...prev, [commentId]: false }));

      if (error) {
        onError?.("No se pudo borrar el comentario.");
        return false;
      }

      setCommentsByPostId((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((comment) => comment.id !== commentId),
      }));

      return true;
    },
    [commentsByPostId, currentUserId, onError],
  );

  return {
    enrichPostsWithCommentCounts,
    openByPostId,
    loadingByPostId,
    submittingByPostId,
    deletingByCommentId,
    commentsByPostId,
    toggleComments,
    addComment,
    removeComment,
  };
}
