import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  PHOTO_LIMIT,
  QR_INTRO_SECONDS,
  REFRESH_INTERVAL_MS,
  SLIDE_INTERVAL_MS,
  STORAGE_BUCKET,
} from "./liveScreenConstants";
import { getOriginalUrlFromFeedUrl, isVideoUrl } from "./liveScreenMediaUtils";

function useLiveScreenMedia() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [introCycleKey, setIntroCycleKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const wasShowingEmptyQrRef = useRef(false);
  const mediaItemsRef = useRef([]);
  const pendingMediaRef = useRef([]);

  const restartCycleWithIntro = useCallback(() => {
    setShowIntro(true);
    setCurrentIndex(0);
    setIntroCycleKey((prev) => prev + 1);
  }, []);

  const queuePendingMedia = useCallback((items) => {
    if (!items.length) {
      return;
    }

    const existingIds = new Set(mediaItemsRef.current.map((item) => String(item.id)));
    const pendingIds = new Set(pendingMediaRef.current.map((item) => String(item.id)));

    const uniqueItems = items.filter((item) => {
      const itemId = String(item.id);
      return !existingIds.has(itemId) && !pendingIds.has(itemId);
    });

    if (!uniqueItems.length) {
      return;
    }

    pendingMediaRef.current = [...uniqueItems, ...pendingMediaRef.current]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, PHOTO_LIMIT);
  }, []);

  const loadLatestMedia = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }
      setError("");

      const { data, error: fetchError } = await supabase
        .from("publicaciones")
        .select("id, foto_url, created_at")
        .order("created_at", { ascending: false })
        .limit(PHOTO_LIMIT);

      if (fetchError) {
        setMediaItems([]);
        setError("No se pudieron cargar las publicaciones para pantalla.");
        if (!silent) {
          setLoading(false);
        }
        return;
      }

      const latestMedia = (data || [])
        .filter((item) => Boolean(item?.foto_url))
        .map((item) => ({
          ...item,
          display_url: getOriginalUrlFromFeedUrl(item.foto_url, supabase, STORAGE_BUCKET),
        }));

      if (silent && mediaItemsRef.current.length > 0) {
        queuePendingMedia(latestMedia);
      } else {
        setMediaItems(latestMedia);
      }

      if (!latestMedia.length) {
        wasShowingEmptyQrRef.current = true;
      }

      if (wasShowingEmptyQrRef.current && latestMedia.length > 0) {
        setShowIntro(false);
        setCurrentIndex(0);
        wasShowingEmptyQrRef.current = false;
      }

      if (!silent) {
        setLoading(false);
      }
    },
    [queuePendingMedia],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLatestMedia();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadLatestMedia]);

  useEffect(() => {
    const pollTimer = setInterval(() => {
      loadLatestMedia({ silent: true });
    }, REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(pollTimer);
    };
  }, [loadLatestMedia]);

  useEffect(() => {
    mediaItemsRef.current = mediaItems;
  }, [mediaItems]);

  useEffect(() => {
    if (!showIntro) {
      return undefined;
    }

    const introTimer = setTimeout(() => {
      setCurrentIndex(0);
      setShowIntro(false);
    }, QR_INTRO_SECONDS * 1000);

    return () => {
      clearTimeout(introTimer);
    };
  }, [showIntro, introCycleKey]);

  useEffect(() => {
    if (showIntro || mediaItems.length === 0) {
      return undefined;
    }

    if (mediaItems.length === 1) {
      const singleTimer = setTimeout(() => {
        if (pendingMediaRef.current.length > 0) {
          const queuedItems = pendingMediaRef.current;
          pendingMediaRef.current = [];

          setMediaItems((prevMedia) => {
            const prevIds = new Set(prevMedia.map((item) => String(item.id)));
            const uniqueQueued = queuedItems.filter((item) => !prevIds.has(String(item.id)));
            return [...uniqueQueued, ...prevMedia].slice(0, PHOTO_LIMIT);
          });
        }

        restartCycleWithIntro();
      }, SLIDE_INTERVAL_MS);

      return () => {
        clearTimeout(singleTimer);
      };
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;

        if (next >= mediaItems.length) {
          if (pendingMediaRef.current.length > 0) {
            const queuedItems = pendingMediaRef.current;
            pendingMediaRef.current = [];

            setMediaItems((prevMedia) => {
              const prevIds = new Set(prevMedia.map((item) => String(item.id)));
              const uniqueQueued = queuedItems.filter((item) => !prevIds.has(String(item.id)));
              return [...uniqueQueued, ...prevMedia].slice(0, PHOTO_LIMIT);
            });
          }

          restartCycleWithIntro();
          return 0;
        }

        return next;
      });
    }, SLIDE_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [mediaItems.length, restartCycleWithIntro, showIntro]);

  useEffect(() => {
    if (!loading && !error && mediaItems.length === 0) {
      wasShowingEmptyQrRef.current = true;
    }
  }, [error, loading, mediaItems.length]);

  useEffect(() => {
    const channel = supabase
      .channel("oriana-live-screen")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "publicaciones",
        },
        (payload) => {
          const newRow = payload?.new;
          if (!newRow?.id || !newRow?.foto_url) {
            return;
          }

          const nextPhoto = {
            id: newRow.id,
            foto_url: newRow.foto_url,
            display_url: getOriginalUrlFromFeedUrl(newRow.foto_url, supabase, STORAGE_BUCKET),
            created_at: newRow.created_at,
          };

          if (mediaItemsRef.current.length === 0 && wasShowingEmptyQrRef.current) {
            setMediaItems([nextPhoto]);
            setShowIntro(false);
            setCurrentIndex(0);
            wasShowingEmptyQrRef.current = false;
            return;
          }

          queuePendingMedia([nextPhoto]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queuePendingMedia]);

  const safeIndex = mediaItems.length ? currentIndex % mediaItems.length : 0;

  const currentPhoto = useMemo(() => {
    if (!mediaItems.length) {
      return null;
    }

    return mediaItems[safeIndex] || mediaItems[0];
  }, [mediaItems, safeIndex]);

  const shouldShowIntro = showIntro || (!loading && !error && mediaItems.length === 0);
  const currentMediaUrl = currentPhoto?.display_url || currentPhoto?.foto_url || "";
  const currentIsVideo = isVideoUrl(currentMediaUrl);
  const currentMediaKey = `${currentPhoto?.id || "media"}-${safeIndex}`;

  return {
    currentIsVideo,
    currentMediaKey,
    currentMediaUrl,
    currentPhoto,
    error,
    loading,
    mediaItems,
    safeIndex,
    shouldShowIntro,
  };
}

export { useLiveScreenMedia };
