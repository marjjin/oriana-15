import { useEffect, useMemo, useState } from "react";
import { DEFAULT_ADJUSTMENTS } from "../constants";

const UPLOAD_OPEN_SESSION_KEY = "oriana_upload_modal_open";
const UPLOAD_CAPTION_SESSION_KEY = "oriana_upload_modal_caption";

function useUploadModalState() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return sessionStorage.getItem(UPLOAD_OPEN_SESSION_KEY) === "1";
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return sessionStorage.getItem(UPLOAD_CAPTION_SESSION_KEY) || "";
  });
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [adjustments, setAdjustments] = useState(DEFAULT_ADJUSTMENTS);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [localError, setLocalError] = useState("");

  const isVideoFile = selectedFile?.type?.startsWith("video/") || false;
  const isImageFile = selectedFile?.type?.startsWith("image/") || false;

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return "";
    }

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove("oriana-upload-open");
      return;
    }

    document.body.classList.add("oriana-upload-open");

    return () => {
      document.body.classList.remove("oriana-upload-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (isOpen) {
      sessionStorage.setItem(UPLOAD_OPEN_SESSION_KEY, "1");
    } else {
      sessionStorage.removeItem(UPLOAD_OPEN_SESSION_KEY);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (caption) {
      sessionStorage.setItem(UPLOAD_CAPTION_SESSION_KEY, caption);
    } else {
      sessionStorage.removeItem(UPLOAD_CAPTION_SESSION_KEY);
    }
  }, [caption]);

  const resetState = () => {
    setSelectedFile(null);
    setCaption("");
    setRotation(0);
    setFlipHorizontal(false);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSelectedAdjustment(null);
    setLocalError("");
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    resetState();
    setIsOpen(false);
  };

  const handleSelectFile = (event) => {
    const nextFile = event.target.files?.[0] || null;

    if (nextFile && !nextFile.type.startsWith("image/") && !nextFile.type.startsWith("video/")) {
      setLocalError("Solo podés subir imágenes o videos.");
      event.target.value = "";
      return;
    }

    setSelectedFile(nextFile);
    setRotation(0);
    setFlipHorizontal(false);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSelectedAdjustment(null);
    setLocalError("");
  };

  const clearSelectedFileState = () => {
    setSelectedFile(null);
    setRotation(0);
    setFlipHorizontal(false);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSelectedAdjustment(null);
    setLocalError("");
  };

  const toggleAdjustment = (adjustmentKey) => {
    setSelectedAdjustment((prev) => (prev === adjustmentKey ? null : adjustmentKey));
  };

  const changeAdjustment = (nextValue) => {
    if (!selectedAdjustment) {
      return;
    }

    setAdjustments((prev) => ({
      ...prev,
      [selectedAdjustment]: nextValue,
    }));
  };

  const resetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSelectedAdjustment(null);
  };

  return {
    isOpen,
    selectedFile,
    caption,
    rotation,
    flipHorizontal,
    adjustments,
    selectedAdjustment,
    localError,
    isVideoFile,
    isImageFile,
    previewUrl,
    setCaption,
    setRotation,
    setFlipHorizontal,
    setLocalError,
    openModal,
    closeModal,
    handleSelectFile,
    clearSelectedFileState,
    toggleAdjustment,
    changeAdjustment,
    resetAdjustments,
  };
}

export default useUploadModalState;
