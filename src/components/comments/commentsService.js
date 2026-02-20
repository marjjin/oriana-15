import { supabase } from "../../lib/supabaseClient";

const COMMENTS_TABLE =
  import.meta.env.VITE_SUPABASE_COMMENTS_TABLE || "publicacion_comentarios";
const POST_ID_COLUMN =
  import.meta.env.VITE_SUPABASE_COMMENTS_POST_ID_COLUMN || "publicacion_id";
const TEXT_COLUMN =
  import.meta.env.VITE_SUPABASE_COMMENTS_TEXT_COLUMN || "comentario";

function isMissingCommentsTable(error) {
  if (!error) {
    return false;
  }

  return (
    error.code === "42P01" ||
    error.message?.toLowerCase().includes("does not exist") ||
    error.message?.toLowerCase().includes("could not find")
  );
}

export async function fetchCommentsByPostId(postId) {
  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .select(`id, ${POST_ID_COLUMN}, user_id, ${TEXT_COLUMN}, created_at`)
    .eq(POST_ID_COLUMN, postId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      comments: [],
      missingTable: isMissingCommentsTable(error),
      error,
    };
  }

  const userIds = [...new Set((data || []).map((row) => row.user_id).filter(Boolean))];
  let usersById = {};

  if (userIds.length > 0) {
    const { data: usersRows } = await supabase
      .from("users")
      .select("id, user_name")
      .in("id", userIds);

    usersById = (usersRows || []).reduce((acc, user) => {
      acc[user.id] = user.user_name;
      return acc;
    }, {});
  }

  const comments = (data || []).map((row) => ({
    id: row.id,
    postId: row[POST_ID_COLUMN],
    userId: row.user_id,
    userName: usersById[row.user_id] || "Usuario",
    text: row[TEXT_COLUMN] || "",
    createdAt: row.created_at,
  }));

  return { comments, missingTable: false, error: null };
}

export async function fetchCommentSummaryByPostIds(postIds) {
  if (!postIds.length) {
    return { countsByPostId: {}, missingTable: false, error: null };
  }

  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .select(`${POST_ID_COLUMN}`)
    .in(POST_ID_COLUMN, postIds);

  if (error) {
    return {
      countsByPostId: {},
      missingTable: isMissingCommentsTable(error),
      error,
    };
  }

  const countsByPostId = {};

  for (const row of data || []) {
    const postId = String(row[POST_ID_COLUMN]);
    countsByPostId[postId] = (countsByPostId[postId] || 0) + 1;
  }

  return { countsByPostId, missingTable: false, error: null };
}

export async function createComment({ postId, userId, text }) {
  const payload = {
    [POST_ID_COLUMN]: postId,
    user_id: userId,
    [TEXT_COLUMN]: text.trim(),
  };

  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .insert([payload])
    .select(`id, user_id, ${TEXT_COLUMN}, created_at`)
    .single();

  if (error) {
    return { comment: null, error };
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("id, user_name")
    .eq("id", userId)
    .maybeSingle();

  return {
    comment: {
      id: data.id,
      postId,
      userId: data.user_id,
      userName: userRow?.user_name || "Usuario",
      text: data[TEXT_COLUMN] || text.trim(),
      createdAt: data.created_at,
    },
    error: null,
  };
}

export async function deleteCommentById(commentId) {
  const { error } = await supabase
    .from(COMMENTS_TABLE)
    .delete()
    .eq("id", commentId);

  return { error };
}
