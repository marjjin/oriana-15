import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProfileData } from "./hooks/useProfileData";
import { useProfileEditor } from "./hooks/useProfileEditor";
import { deleteProfilePost } from "./services/profileService";
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
  const [postToDelete, setPostToDelete] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [deletePostError, setDeletePostError] = useState("");
  const currentUser = useMemo(() => currentUserProp || getSavedUser(), [currentUserProp]);
  const targetUserId = routeUserId || currentUser?.id;
  const isOwnProfile = String(targetUserId) === String(currentUser?.id);

  useEffect(() => {
    if (!currentUser?.id) {
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  const { loading, error, profileName, profileAvatarUrl, posts, reloadProfile } = useProfileData(
    targetUserId,
    isOwnProfile ? currentUser.user_name : undefined,
  );
  const { saving, error: profileEditError, saveProfile, clearProfileError } = useProfileEditor({
    userId: currentUser.id,
    reloadProfile,
    onProfileUpdate,
  });

  if (!currentUser?.id) {
    return null;
  }

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

  const handleAskDeletePost = (post) => {
    if (!isOwnProfile || !post?.id) {
      return;
    }

    setPostToDelete(post);
  };

  const handleCancelDeletePost = () => {
    if (deletingPostId) {
      return;
    }

    setPostToDelete(null);
  };

  const handleConfirmDeletePost = async () => {
    if (!isOwnProfile || !postToDelete?.id) {
      return;
    }

    setDeletePostError("");
    setDeletingPostId(postToDelete.id);

    const { error: deleteError } = await deleteProfilePost(currentUser.id, postToDelete.id);

    if (deleteError) {
      setDeletePostError("No se pudo eliminar la publicación.");
      setDeletingPostId(null);
      return;
    }

    if (viewerImage && viewerImage === postToDelete.foto_url) {
      handleCloseImageViewer();
    }

    setPostToDelete(null);
    await reloadProfile();
    setDeletingPostId(null);
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
        {deletePostError && <p className="oriana-profile__error">{deletePostError}</p>}

        <ProfilePostsGrid
          posts={posts}
          loading={loading}
          canDelete={isOwnProfile}
          deletingPostId={deletingPostId}
          onDeletePost={handleAskDeletePost}
          onOpenPostMedia={(post) => handleOpenImageViewer(post?.foto_url, "Publicación")}
        />
      </div>

      {Boolean(postToDelete) && (
        <div className="oriana-profile-modal" onClick={handleCancelDeletePost}>
          <div className="oriana-profile-modal__content" onClick={(event) => event.stopPropagation()}>
            <div className="oriana-profile-modal__header">
              <h4 className="oriana-profile-modal__title">Eliminar publicación</h4>
              <button
                type="button"
                className="oriana-profile-modal__close"
                onClick={handleCancelDeletePost}
                aria-label="Cerrar confirmación"
                disabled={Boolean(deletingPostId)}
              >
                ✕
              </button>
            </div>

            <p className="oriana-profile-modal__confirm-text">
              ¿Seguro que querés eliminar esta publicación? Esta acción no se puede deshacer.
            </p>

            <div className="oriana-profile-modal__confirm-actions">
              <button
                type="button"
                className="oriana-profile-modal__cancel"
                onClick={handleCancelDeletePost}
                disabled={Boolean(deletingPostId)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="oriana-profile-modal__delete"
                onClick={handleConfirmDeletePost}
                disabled={Boolean(deletingPostId)}
              >
                {deletingPostId ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

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
