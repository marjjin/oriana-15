import { supabase } from "../../../lib/supabaseClient";

const PROFILE_BUCKET =
  import.meta.env.VITE_SUPABASE_PROFILE_BUCKET ||
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ||
  "feed-images";

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
