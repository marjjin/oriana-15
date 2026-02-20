import "./likes.css";

function HeartIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 21c-.31 0-.61-.1-.86-.3C8.21 18.35 3 14.18 3 9.75 3 7.13 5.13 5 7.75 5c1.62 0 3.13.81 4.03 2.11A4.92 4.92 0 0 1 15.81 5C18.43 5 20.56 7.13 20.56 9.75c0 4.43-5.2 8.6-8.14 10.95-.25.2-.55.3-.86.3Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LikeButton({ liked, count, pending, onToggle }) {
  return (
    <div className="oriana-like">
      <button
        type="button"
        className={`oriana-like__button ${liked ? "oriana-like__button--active" : ""}`}
        onClick={onToggle}
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? "Quitar me gusta" : "Dar me gusta"}
      >
        <span className="oriana-like__icon">
          <HeartIcon active={liked} />
        </span>
      </button>
      <span className="oriana-like__count">
        {count}
      </span>
    </div>
  );
}

export default LikeButton;
