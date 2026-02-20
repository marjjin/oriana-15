import { useCallback, useEffect, useState } from "react";
import { fetchProfileSummary } from "../services/profileService";

export function useProfileData(userId, fallbackName) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileName, setProfileName] = useState(fallbackName || "Usuario");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const [posts, setPosts] = useState([]);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError("");

    const {
      profileName: dbName,
      profileAvatarUrl: dbAvatarUrl,
      posts: profilePosts,
      error: profileError,
    } =
      await fetchProfileSummary(userId);

    if (profileError) {
      setProfileName(fallbackName || dbName || "Usuario");
      setProfileAvatarUrl(dbAvatarUrl || "");
      setPosts([]);
      setError("No se pudo cargar el perfil.");
      setLoading(false);
      return;
    }

    setProfileName(fallbackName || dbName || "Usuario");
    setProfileAvatarUrl(dbAvatarUrl || "");
    setPosts(profilePosts || []);
    setLoading(false);
  }, [fallbackName, userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadProfile]);

  return { loading, error, profileName, profileAvatarUrl, posts, reloadProfile: loadProfile };
}
