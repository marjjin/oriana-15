import { supabase } from "../../lib/supabaseClient";

const LIKES_TABLE = import.meta.env.VITE_SUPABASE_LIKES_TABLE || "publicacion_likes";
const POST_ID_COLUMN =
  import.meta.env.VITE_SUPABASE_LIKES_POST_ID_COLUMN || "publicacion_id";

function isMissingLikesTable(error) {
  if (!error) {
    return false;
  }

  return (
    error.code === "42P01" ||
    error.message?.toLowerCase().includes("does not exist") ||
    error.message?.toLowerCase().includes("could not find")
  );
}

export async function fetchLikeSummaryByPostIds(postIds, currentUserId) {
  if (!postIds.length) {
    return { countsByPostId: {}, likedByCurrentUser: new Set(), missingTable: false };
  }

  const normalizedCurrentUserId = currentUserId == null ? null : String(currentUserId);

  const { data, error } = await supabase
    .from(LIKES_TABLE)
    .select(`${POST_ID_COLUMN}, user_id`)
    .in(POST_ID_COLUMN, postIds);

  if (error) {
    return {
      countsByPostId: {},
      likedByCurrentUser: new Set(),
      missingTable: isMissingLikesTable(error),
      error,
    };
  }

  const countsByPostId = {};
  const likedByCurrentUser = new Set();

  for (const row of data || []) {
    const postId = row[POST_ID_COLUMN];
    const normalizedPostId = String(postId);

    countsByPostId[normalizedPostId] = (countsByPostId[normalizedPostId] || 0) + 1;
    if (normalizedCurrentUserId && String(row.user_id) === normalizedCurrentUserId) {
      likedByCurrentUser.add(normalizedPostId);
    }
  }

  return { countsByPostId, likedByCurrentUser, missingTable: false };
}

export async function addLike(postId, userId) {
  const { error } = await supabase.from(LIKES_TABLE).insert([
    {
      [POST_ID_COLUMN]: postId,
      user_id: userId,
    },
  ]);

  if (error && error.code === "23505") {
    return { error: null };
  }

  return { error };
}

export async function removeLike(postId, userId) {
  const { error } = await supabase
    .from(LIKES_TABLE)
    .delete()
    .eq(POST_ID_COLUMN, postId)
    .eq("user_id", userId);

  return { error };
}
