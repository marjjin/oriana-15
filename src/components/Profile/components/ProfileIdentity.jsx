function ProfileIdentity({ userName, avatarUrl, onEdit, showEdit, onOpenAvatar }) {
  const firstLetter = (userName || "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="oriana-profile__identity">
      <button
        type="button"
        className="oriana-profile__avatar-wrap"
        aria-label={avatarUrl ? `Ver foto de perfil de ${userName}` : "Sin foto de perfil"}
        onClick={() => avatarUrl && onOpenAvatar?.()}
      >
        {avatarUrl ? (
          <img className="oriana-profile__avatar" src={avatarUrl} alt={`Foto de ${userName}`} />
        ) : (
          <span className="oriana-profile__avatar-fallback">{firstLetter}</span>
        )}
      </button>

      <div className="oriana-profile__identity-content">
        <p className="oriana-profile__name">@{userName}</p>
        {showEdit && (
          <button type="button" className="oriana-profile__edit" onClick={onEdit}>
            Editar perfil
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfileIdentity;
