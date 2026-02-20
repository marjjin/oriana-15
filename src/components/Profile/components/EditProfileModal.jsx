import { useEffect, useState } from "react";

function EditProfileModal({
  open,
  initialName,
  initialAvatarUrl,
  saving,
  error,
  onClose,
  onSave,
}) {
  const [name, setName] = useState(initialName || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(initialAvatarUrl || "");

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(initialName || "");
    setAvatarFile(null);
    setAvatarPreviewUrl(initialAvatarUrl || "");
  }, [initialAvatarUrl, initialName, open]);

  useEffect(() => {
    if (!avatarFile) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile]);

  if (!open) {
    return null;
  }

  const handlePickAvatar = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      return;
    }

    setAvatarFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({ name, avatarFile });
  };

  return (
    <div className="oriana-profile-modal" onClick={onClose}>
      <form
        className="oriana-profile-modal__content"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="oriana-profile-modal__header">
          <h4 className="oriana-profile-modal__title">Editar perfil</h4>
          <button type="button" className="oriana-profile-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <label className="oriana-profile-modal__label" htmlFor="profile_name">
          Nombre de usuario
        </label>
        <input
          id="profile_name"
          className="oriana-profile-modal__input"
          type="text"
          maxLength={24}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tu nombre"
        />

        <p className="oriana-profile-modal__label">Foto de perfil</p>

        <div className="oriana-profile-modal__avatar-editor">
          <div className="oriana-profile-modal__avatar-preview-wrap" aria-hidden="true">
            {avatarPreviewUrl ? (
              <img
                className="oriana-profile-modal__avatar-preview"
                src={avatarPreviewUrl}
                alt="Vista previa de foto de perfil"
              />
            ) : (
              <span className="oriana-profile-modal__avatar-fallback">
                {(name || "U").trim().charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>

          <div className="oriana-profile-modal__avatar-actions">
            <label className="oriana-profile-modal__picker">
              Sacar foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePickAvatar}
              />
            </label>

            <label className="oriana-profile-modal__picker">
              Elegir de galería
              <input
                type="file"
                accept="image/*"
                onChange={handlePickAvatar}
              />
            </label>
          </div>
        </div>

        {error && <p className="oriana-profile-modal__error">{error}</p>}

        <button type="submit" className="oriana-profile-modal__save" disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

export default EditProfileModal;
