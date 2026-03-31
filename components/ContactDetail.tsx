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
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
};

export default function ContactDetail({ contact, onEdit, onDelete, onBack }: Props) {
  const colorClass = getAvatarColor(contact.name);
  const initials = getInitials(contact.name);

  const handleDelete = () => {
    if (confirm(`Удалить контакт "${contact.name}"?`)) {
      onDelete();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7]">
      {/* Navigation bar */}
      <div className="flex items-center justify-between px-4 pt-safe-top pt-4 pb-2 bg-[#F2F2F7]">
        <button onClick={onBack} className="flex items-center gap-1 text-[#007AFF] touchable">
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M9 1L1 8L9 15" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[17px]">Назад</span>
        </button>
        <button onClick={onEdit} className="text-[#007AFF] text-[17px] touchable">
          Изменить
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Header with avatar */}
        <div className="flex flex-col items-center pt-6 pb-8 px-4">
          <div className={`w-[96px] h-[96px] rounded-full flex items-center justify-center ${colorClass} mb-3`}>
            <span className="text-white font-semibold text-[36px] leading-none">
              {initials}
            </span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#1C1C1E] text-center leading-tight">
            {contact.name}
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 px-4 mb-8 justify-center">
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex flex-col items-center gap-1 touchable"
            >
              <div className="w-[56px] h-[56px] bg-[#34C759] rounded-full flex items-center justify-center shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </div>
              <span className="text-[12px] text-[#34C759] font-medium">Позвонить</span>
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex flex-col items-center gap-1 touchable"
            >
              <div className="w-[56px] h-[56px] bg-[#007AFF] rounded-full flex items-center justify-center shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <span className="text-[12px] text-[#007AFF] font-medium">Email</span>
            </a>
          )}
        </div>

        {/* Contact details */}
        {(contact.phone || contact.email) && (
          <div className="mx-4 mb-6">
            <div className="bg-white rounded-[10px] overflow-hidden">
              {contact.phone && (
                <div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-between px-4 py-4 active:bg-[#F2F2F7] touchable"
                  >
                    <div>
                      <p className="text-[12px] text-[#8E8E93] mb-0.5">Мобильный</p>
                      <p className="text-[17px] text-[#007AFF]">{contact.phone}</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#34C759">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </a>
                  {contact.email && <div className="ml-4 h-[0.5px] bg-[#C6C6C8]" />}
                </div>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center justify-between px-4 py-4 active:bg-[#F2F2F7] touchable"
                >
                  <div>
                    <p className="text-[12px] text-[#8E8E93] mb-0.5">Email</p>
                    <p className="text-[17px] text-[#007AFF]">{contact.email}</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#007AFF">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {contact.notes && (
          <div className="mx-4 mb-6">
            <p className="text-[13px] text-[#8E8E93] uppercase font-medium px-1 mb-1">
              Заметки
            </p>
            <div className="bg-white rounded-[10px] px-4 py-3">
              <p className="text-[17px] text-[#1C1C1E] whitespace-pre-wrap leading-relaxed">
                {contact.notes}
              </p>
            </div>
          </div>
        )}

        {/* Delete button */}
        <div className="mx-4 mb-8">
          <button
            onClick={handleDelete}
            className="w-full bg-white rounded-[10px] py-4 text-[#FF3B30] text-[17px] font-medium text-center touchable active:bg-[#F2F2F7]"
          >
            Удалить контакт
          </button>
        </div>
      </div>
    </div>
  );
}
