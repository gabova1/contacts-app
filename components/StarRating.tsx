"use client";

type Props = {
  value: number;          // 0-3
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
};

export default function StarRating({ value, onChange, size = 24, readonly = false }: Props) {
  const handleTap = (star: number) => {
    if (readonly || !onChange) return;
    // tap the same star → reset to 0
    onChange(value === star ? 0 : star);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleTap(star)}
          disabled={readonly}
          className={readonly ? "cursor-default" : "touchable"}
          aria-label={`${star} звезда`}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={star <= value ? "#FF9500" : "none"}
            stroke={star <= value ? "#FF9500" : "#C7C7CC"}
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ))}
    </div>
  );
}
