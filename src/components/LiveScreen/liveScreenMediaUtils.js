function isVideoUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  const cleanUrl = url.split("?")[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(cleanUrl);
}

function getOriginalUrlFromFeedUrl(feedUrl, supabase, storageBucket) {
  if (!feedUrl || typeof feedUrl !== "string") {
    return "";
  }

  if (isVideoUrl(feedUrl)) {
    return feedUrl;
  }

  const marker = `/storage/v1/object/public/${storageBucket}/`;
  const markerIndex = feedUrl.indexOf(marker);
  if (markerIndex === -1) {
    return feedUrl;
  }

  const objectPath = feedUrl.slice(markerIndex + marker.length);
  const slashIndex = objectPath.indexOf("/");
  if (slashIndex === -1) {
    return feedUrl;
  }

  const userId = objectPath.slice(0, slashIndex);
  const fileName = objectPath.slice(slashIndex + 1);
  if (!userId || !fileName) {
    return feedUrl;
  }

  const { data } = supabase.storage
    .from(storageBucket)
    .getPublicUrl(`originals/${userId}/${fileName}`);

  return data?.publicUrl || feedUrl;
}

export { getOriginalUrlFromFeedUrl, isVideoUrl };
