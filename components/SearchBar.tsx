"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="px-4 py-2 bg-[#F2F2F7]">
      <div className="relative flex items-center bg-white rounded-[10px] px-3 py-2 gap-2 shadow-sm">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8E8E93"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Поиск"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[17px] text-[#1C1C1E] placeholder-[#8E8E93]"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="flex-shrink-0 w-5 h-5 bg-[#8E8E93] rounded-full flex items-center justify-center touchable"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
