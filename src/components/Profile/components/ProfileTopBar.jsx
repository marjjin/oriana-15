function ProfileTopBar({ onBack, onLogout }) {
  return (
    <div className="oriana-profile__topbar">
      <button type="button" className="oriana-profile__back" onClick={onBack}>
        ← Feed
      </button>

      <h2 className="oriana-profile__title">Perfil</h2>

      <button type="button" className="oriana-profile__logout" onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default ProfileTopBar;
