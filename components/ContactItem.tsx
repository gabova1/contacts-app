"use client";

import { Contact } from "@/lib/supabase";

const AVATAR_COLORS = [
  "avatar-blue",
  "avatar-green",
  "avatar-orange",
  "avatar-pink",
  "avatar-purple",
  "avatar-red",
  "avatar-teal",
  "avatar-yellow",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type Props = {
  contact: Contact;
  onClick: (contact: Contact) => void;
  isLast?: boolean;
};

export default function ContactItem({ contact, onClick, isLast }: Props) {
  const colorClass = getAvatarColor(contact.name);
  const initials = getInitials(contact.name);

  return (
    <button
      onClick={() => onClick(contact)}
      className="w-full flex items-center px-4 py-3 bg-white active:bg-[#F2F2F7] transition-colors duration-100 touchable"
    >
      {/* Avatar */}
      {contact.photo ? (
        <img
          src={contact.photo}
          alt={contact.name}
          className="w-[44px] h-[44px] rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <span className="text-white font-semibold text-[17px] leading-none">
            {initials}
          </span>
        </div>
      )}

      {/* Name */}
      <div className="flex-1 ml-3 flex items-center min-w-0">
        <span className="text-[17px] text-[#1C1C1E] truncate">{contact.name}</span>
      </div>

      {/* Chevron */}
      <svg
        width="8"
        height="13"
        viewBox="0 0 8 13"
        fill="none"
        className="flex-shrink-0 ml-2"
      >
        <path
          d="M1 1L7 6.5L1 12"
          stroke="#C6C6C8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Bottom separator (not for last item) */}
      {!isLast && (
        <div className="absolute left-[72px] right-0 bottom-0 h-[0.5px] bg-[#C6C6C8]" />
      )}
    </button>
  );
}
