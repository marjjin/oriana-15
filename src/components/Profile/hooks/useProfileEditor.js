import { useState } from "react";
import { updateProfile } from "../services/profileService";

export function useProfileEditor({ userId, reloadProfile, onProfileUpdate }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveProfile = async ({ name, avatarFile }) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("El nombre no puede estar vacío.");
      return false;
    }

    setSaving(true);
    setError("");

    const {
      updatedName,
      updatedAvatarUrl,
      error: updateError,
      errorCode,
    } = await updateProfile(userId, {
      userName: trimmedName,
      avatarFile,
    });

    setSaving(false);

    if (errorCode === "USERNAME_TAKEN") {
      setError("Ese nombre de usuario ya está en uso.");
      return false;
    }

    if (errorCode === "AVATAR_NOT_PERSISTED" || errorCode === "UPDATE_NOT_APPLIED") {
      setError("No se pudo guardar la foto en la base de datos. Revisá la columna/policies de users.");
      return false;
    }

    if (updateError) {
      setError("No se pudo actualizar el perfil.");
      return false;
    }

    const updates = {
      user_name: updatedName,
    };

    if (typeof updatedAvatarUrl === "string") {
      updates.profile_photo_url = updatedAvatarUrl;
    }

    onProfileUpdate?.(updates);

    await reloadProfile();
    return true;
  };

  return { saving, error, saveProfile, clearProfileError: () => setError("") };
}
