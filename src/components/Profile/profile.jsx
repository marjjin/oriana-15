import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProfileData } from "./hooks/useProfileData";
import { useProfileEditor } from "./hooks/useProfileEditor";
import ProfileTopBar from "./components/ProfileTopBar";
import ProfileStats from "./components/ProfileStats";
import ProfilePostsGrid from "./components/ProfilePostsGrid";
import ProfileIdentity from "./components/ProfileIdentity";
import EditProfileModal from "./components/EditProfileModal";
import ProfileImageViewer from "./components/ProfileImageViewer";
import "./styles/profile.css";

const SESSION_KEY = "oriana_current_user";

function getSavedUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function Profile({ currentUser: currentUserProp, onLogout, onProfileUpdate }) {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");
  const currentUser = useMemo(() => currentUserProp || getSavedUser(), [currentUserProp]);
  const targetUserId = routeUserId || currentUser?.id;
  const isOwnProfile = String(targetUserId) === String(currentUser?.id);

  useEffect(() => {
    if (!currentUser?.id) {
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser?.id) {
    return null;
  }

  const { loading, error, profileName, profileAvatarUrl, posts, reloadProfile } = useProfileData(
    targetUserId,
    isOwnProfile ? currentUser.user_name : undefined,
  );
  const { saving, error: profileEditError, saveProfile, clearProfileError } = useProfileEditor({
    userId: currentUser.id,
    reloadProfile,
    onProfileUpdate,
  });

  const handleBack = () => {
    navigate("/feed");
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    localStorage.removeItem(SESSION_KEY);
    navigate("/", { replace: true });
  };

  const handleOpenEdit = () => {
    if (!isOwnProfile) {
      return;
    }

    clearProfileError();
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    if (saving) {
      return;
    }
    clearProfileError();
    setIsEditOpen(false);
  };

  const handleSaveProfile = async ({ name, avatarFile }) => {
    if (!isOwnProfile) {
      return;
    }

    const success = await saveProfile({ name, avatarFile });
    if (success) {
      setIsEditOpen(false);
    }
  };

  const handleOpenImageViewer = (imageUrl, title = "Vista previa") => {
    if (!imageUrl) {
      return;
    }

    setViewerImage(imageUrl);
    setViewerTitle(title);
  };

  const handleCloseImageViewer = () => {
    setViewerImage("");
    setViewerTitle("");
  };

  return (
    <section className="oriana-profile">
      <div className="oriana-profile__container">
        <ProfileTopBar onBack={handleBack} onLogout={handleLogout} />

        <div className="oriana-profile__hero">
          <ProfileIdentity
            userName={profileName}
            avatarUrl={profileAvatarUrl}
            onEdit={handleOpenEdit}
            showEdit={isOwnProfile}
            onOpenAvatar={() => handleOpenImageViewer(profileAvatarUrl, `Foto de @${profileName}`)}
          />
          <ProfileStats totalPosts={posts.length} />
        </div>

        <h3 className="oriana-profile__section-title">
          {isOwnProfile ? "Mis publicaciones" : "Publicaciones"}
        </h3>

        {error && <p className="oriana-profile__error">{error}</p>}

        <ProfilePostsGrid
          posts={posts}
          loading={loading}
          onOpenPostImage={(post) => handleOpenImageViewer(post?.foto_url, "Publicación")}
        />
      </div>

      <EditProfileModal
        open={isOwnProfile && isEditOpen}
        initialName={profileName}
        initialAvatarUrl={profileAvatarUrl}
        saving={saving}
        error={profileEditError}
        onClose={handleCloseEdit}
        onSave={handleSaveProfile}
      />

      <ProfileImageViewer
        open={Boolean(viewerImage)}
        imageUrl={viewerImage}
        title={viewerTitle}
        onClose={handleCloseImageViewer}
      />
    </section>
  );
}

export default Profile;
