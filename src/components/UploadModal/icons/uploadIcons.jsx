function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M8 7.5h1.2l1-1.6a1.5 1.5 0 0 1 1.28-.72h1.04c.52 0 1 .27 1.28.72l1 1.6H16a3 3 0 0 1 3 3v6.5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V10.5a3 3 0 0 1 3-3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="13.5"
        r="3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect
        x="4.5"
        y="5.5"
        width="15"
        height="13"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="9" cy="10" r="1.3" fill="currentColor" />
      <path
        d="m7.3 16.5 3.5-3.5a1.3 1.3 0 0 1 1.84 0l1 1 1.15-1.15a1.3 1.3 0 0 1 1.84 0l1.87 1.87"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M7 8.5H3.8V5.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.2 8.5a8 8 0 1 1 2.3 9.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlipIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 5v14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M11.2 18H6.6a1.6 1.6 0 0 1-1.6-1.6V7.6A1.6 1.6 0 0 1 6.6 6h4.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12.8 18h4.6a1.6 1.6 0 0 0 1.6-1.6V7.6A1.6 1.6 0 0 0 17.4 6h-4.6Z"
        fill="currentColor"
        opacity="0.2"
      />
    </svg>
  );
}

function BrightnessIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle
        cx="12"
        cy="12"
        r="3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.9 5.9l1.5 1.5M16.6 16.6l1.5 1.5M18.1 5.9l-1.5 1.5M7.4 16.6l-1.5 1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ContrastIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle
        cx="12"
        cy="12"
        r="7.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 4.7a7.3 7.3 0 0 1 0 14.6Z"
        fill="currentColor"
        opacity="0.24"
      />
    </svg>
  );
}

function SaturationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 4.5c2.4 3 5.8 6.5 5.8 9.4a5.8 5.8 0 1 1-11.6 0c0-2.9 3.4-6.4 5.8-9.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 7.4v12.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export {
  CameraIcon,
  GalleryIcon,
  RotateIcon,
  FlipIcon,
  BrightnessIcon,
  ContrastIcon,
  SaturationIcon,
};
