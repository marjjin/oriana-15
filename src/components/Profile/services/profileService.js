import { supabase } from "../../../lib/supabaseClient";

const PROFILE_BUCKET =
  import.meta.env.VITE_SUPABASE_PROFILE_BUCKET ||
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ||
  "feed-images";

const POSTS_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "feed-images";

function extractStoragePathFromPublicUrl(publicUrl, bucket) {
  if (!publicUrl || !bucket) {
    return "";
  }

  try {
    const parsedUrl = new URL(publicUrl);
    const marker = `/object/public/${bucket}/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return "";
    }

    return decodeURIComponent(parsedUrl.pathname.slice(markerIndex + marker.length));
  } catch {
    return "";
  }
}

export async function fetchProfileSummary(userId) {
  const { data: userRow } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const { data: postRows, error: postsError } = await supabase
    .from("publicaciones")
    .select("id, foto_url, descripcion, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (postsError) {
    return {
      profileName: userRow?.user_name || "Usuario",
      profileAvatarUrl: userRow?.profile_photo_url || "",
      posts: [],
      error: postsError,
    };
  }

  return {
    profileName: userRow?.user_name || "Usuario",
    profileAvatarUrl: userRow?.profile_photo_url || "",
    posts: postRows || [],
    error: null,
  };
}

export async function updateProfile(userId, { userName, avatarFile }) {
  const normalizedUserName = userName.trim();

  const { data: sameNameUsers, error: sameNameError } = await supabase
    .from("users")
    .select("id")
    .ilike("user_name", normalizedUserName)
    .neq("id", userId)
    .limit(1);

  if (sameNameError) {
    return {
      updatedName: normalizedUserName,
      updatedAvatarUrl: undefined,
      error: sameNameError,
      errorCode: "USERNAME_CHECK_FAILED",
    };
  }

  if ((sameNameUsers || []).length > 0) {
    return {
      updatedName: normalizedUserName,
      updatedAvatarUrl: undefined,
      error: null,
      errorCode: "USERNAME_TAKEN",
    };
  }

  let nextAvatarUrl = "";
  const shouldUpdateAvatar = avatarFile instanceof File;

  if (shouldUpdateAvatar) {
    const safeName = avatarFile.name.replace(/\s+/g, "-");
    const uniquePart =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.round(Math.random() * 999999)}`;
    const filePath = `profile/${userId}/${Date.now()}-${uniquePart}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(PROFILE_BUCKET)
      .upload(filePath, avatarFile, { upsert: false });

    if (uploadError) {
      return {
        updatedName: normalizedUserName,
        updatedAvatarUrl: "",
        error: uploadError,
        errorCode: "UPLOAD_FAILED",
      };
    }

    const { data: publicData } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(filePath);
    nextAvatarUrl = publicData?.publicUrl || "";
  }

  const { data: updatedNameRows, error: updateNameError } = await supabase
    .from("users")
    .update({ user_name: normalizedUserName })
    .eq("id", userId)
    .select("id, user_name")
    .maybeSingle();

  if (updateNameError) {
    return {
      updatedName: normalizedUserName,
      updatedAvatarUrl: nextAvatarUrl,
      error: updateNameError,
      errorCode: updateNameError.code === "23505" ? "USERNAME_TAKEN" : "UPDATE_FAILED",
    };
  }

  if (!updatedNameRows?.id) {
    return {
      updatedName: normalizedUserName,
      updatedAvatarUrl: nextAvatarUrl,
      error: new Error("No se pudo actualizar el usuario en la base de datos."),
      errorCode: "UPDATE_NOT_APPLIED",
    };
  }

  let updatedAvatarUrl = nextAvatarUrl;

  if (shouldUpdateAvatar) {
    const { data: avatarUpdatedRow, error: avatarError } = await supabase
      .from("users")
      .update({ profile_photo_url: nextAvatarUrl || null })
      .eq("id", userId)
      .select("id")
      .maybeSingle();

    if (avatarError || !avatarUpdatedRow?.id) {
      return {
        updatedName: updatedNameRows?.user_name || normalizedUserName,
        updatedAvatarUrl: nextAvatarUrl || "",
        error:
          avatarError ||
          new Error("No se aplicó la actualización de profile_photo_url en la base de datos."),
        errorCode: "AVATAR_NOT_PERSISTED",
      };
    }

    updatedAvatarUrl = nextAvatarUrl || "";
  }

  return {
    updatedName: updatedNameRows?.user_name || normalizedUserName,
    updatedAvatarUrl: shouldUpdateAvatar ? updatedAvatarUrl : undefined,
    error: null,
    errorCode: null,
  };
}

export async function deleteProfilePost(userId, postId) {
  const { data: postRow, error: postFetchError } = await supabase
    .from("publicaciones")
    .select("id, foto_url")
    .eq("id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (postFetchError) {
    return { error: postFetchError };
  }

  if (!postRow?.id) {
    return { error: new Error("No se encontró la publicación para eliminar.") };
  }

  const { error: deleteDbError } = await supabase
    .from("publicaciones")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId);

  if (deleteDbError) {
    return { error: deleteDbError };
  }

  const storagePath = extractStoragePathFromPublicUrl(postRow.foto_url, POSTS_BUCKET);
  if (storagePath) {
    await supabase.storage.from(POSTS_BUCKET).remove([storagePath]);
  }

  return { error: null };
}
