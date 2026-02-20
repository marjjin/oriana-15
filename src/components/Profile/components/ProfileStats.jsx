function ProfileStats({ totalPosts }) {
  return (
    <div className="oriana-profile__stats">
      <div className="oriana-profile__stat">
        <span className="oriana-profile__stat-value">{totalPosts}</span>
        <span className="oriana-profile__stat-label">Publicaciones</span>
      </div>
    </div>
  );
}

export default ProfileStats;
