import { useCallback, useState } from "react";
import { addLike, fetchLikeSummaryByPostIds, removeLike } from "./likesService";

export function usePostLikes(currentUserId, onError) {
  const [pendingByPostId, setPendingByPostId] = useState({});

  const enrichPostsWithLikes = useCallback(
    async (posts) => {
      const postIds = posts.map((post) => post.id).filter(Boolean);
      const { countsByPostId, likedByCurrentUser, missingTable, error } =
        await fetchLikeSummaryByPostIds(postIds, currentUserId);

      if (error && !missingTable && onError) {
        onError("No se pudieron cargar los likes.");
      }

      return posts.map((post) => ({
        ...post,
        likeCount: countsByPostId[post.id] || 0,
        likedByCurrentUser: likedByCurrentUser.has(String(post.id)),
      }));
    },
    [currentUserId, onError],
  );

  const toggleLike = useCallback(
    async ({ postId, currentlyLiked }) => {
      if (!currentUserId) {
        onError?.("Necesitás iniciar sesión para dar like.");
        return false;
      }

      setPendingByPostId((prev) => ({ ...prev, [postId]: true }));

      const result = currentlyLiked
        ? await removeLike(postId, currentUserId)
        : await addLike(postId, currentUserId);

      setPendingByPostId((prev) => ({ ...prev, [postId]: false }));

      if (result.error) {
        onError?.("No se pudo actualizar el like. Intentá de nuevo.");
        return false;
      }

      return true;
    },
    [currentUserId, onError],
  );

  return { enrichPostsWithLikes, toggleLike, pendingByPostId };
}
