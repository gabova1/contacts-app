"use client";

import { useState } from "react";
import { Contact, ContactList } from "@/lib/supabase";
import StarRating from "./StarRating";

const AVATAR_COLORS = [
  "avatar-blue", "avatar-green", "avatar-orange", "avatar-pink",
  "avatar-purple", "avatar-red", "avatar-teal", "avatar-yellow",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function buildVCard(contact: Contact): string {
  const parts = contact.name.split(" ");
  const lastName = parts.slice(1).join(" ");
  const firstName = parts[0] ?? "";
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${contact.name}`,
    `N:${lastName};${firstName};;;`,
    contact.phone ? `TEL;TYPE=CELL:${contact.phone}` : null,
    contact.email ? `EMAIL:${contact.email}` : null,
    contact.notes ? `NOTE:${contact.notes}` : null,
    "END:VCARD",
  ].filter(Boolean).join("\r\n");
}

type Props = {
  contact: Contact;
  contactListIds: string[];
  lists: ContactList[];
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onAddToList: () => void;
  onRate: (rating: number) => void;
};

export default function ContactDetail({
  contact,
  contactListIds,
  lists,
  onEdit,
  onDelete,
  onBack,
  onAddToList,
  onRate,
}: Props) {
  const colorClass = getAvatarColor(contact.name);
  const initials = getInitials(contact.name);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const handleDelete = () => {
    if (confirm(`Удалить контакт «${contact.name}»?`)) {
      onDelete();
    }
  };

  const handleShare = async () => {
    const text = [
      contact.name,
      contact.phone ? `📞 ${contact.phone}` : null,
      contact.email ? `📧 ${contact.email}` : null,
      contact.notes ? `📝 ${contact.notes}` : null,
    ].filter(Boolean).join("\n");

    const vcardStr = buildVCard(contact);
    const vcardBlob = new Blob([vcardStr], { type: "text/vcard;charset=utf-8" });
    const vcardFile = new File([vcardBlob], `${contact.name}.vcf`, { type: "text/vcard" });

    if (navigator.share) {
      try {
        // Try sharing vCard file (works on iOS/Android)
        if (navigator.canShare && navigator.canShare({ files: [vcardFile] })) {
          await navigator.share({ files: [vcardFile], title: contact.name });
        } else {
          await navigator.share({ title: contact.name, text });
        }
      } catch {
        // User cancelled — no action needed
      }
    } else {
      // Desktop fallback: download .vcf file
      const url = URL.createObjectURL(vcardBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${contact.name}.vcf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Файл контакта скачан");
    }
  };

  const contactLists = lists.filter((l) => contactListIds.includes(l.id));

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
        {/* Avatar + name */}
        <div className="flex flex-col items-center pt-6 pb-8 px-4">
          {contact.photo ? (
            <img
              src={contact.photo}
              alt={contact.name}
              className="w-[96px] h-[96px] rounded-full object-cover mb-3"
            />
          ) : (
            <div className={`w-[96px] h-[96px] rounded-full flex items-center justify-center ${colorClass} mb-3`}>
              <span className="text-white font-semibold text-[36px] leading-none">{initials}</span>
            </div>
          )}
          <h1 className="text-[28px] font-semibold text-[#1C1C1E] text-center leading-tight">
            {contact.name}
          </h1>
          <div className="mt-2">
            <StarRating value={contact.rating} onChange={onRate} size={28} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 px-4 mb-8 justify-center">
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="flex flex-col items-center gap-1 touchable">
              <div className="w-[56px] h-[56px] bg-[#34C759] rounded-full flex items-center justify-center shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </div>
              <span className="text-[12px] text-[#34C759] font-medium">Позвонить</span>
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex flex-col items-center gap-1 touchable">
              <div className="w-[56px] h-[56px] bg-[#007AFF] rounded-full flex items-center justify-center shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <span className="text-[12px] text-[#007AFF] font-medium">Email</span>
            </a>
          )}
          {/* Share button */}
          <button onClick={handleShare} className="flex flex-col items-center gap-1 touchable">
            <div className="w-[56px] h-[56px] bg-[#8E8E93] rounded-full flex items-center justify-center shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
            </div>
            <span className="text-[12px] text-[#8E8E93] font-medium">Поделиться</span>
          </button>
          {/* Add to list */}
          <button onClick={onAddToList} className="flex flex-col items-center gap-1 touchable">
            <div className="w-[56px] h-[56px] bg-[#FF9500] rounded-full flex items-center justify-center shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/>
                <path d="M19 15v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/>
              </svg>
            </div>
            <span className="text-[12px] text-[#FF9500] font-medium">В список</span>
          </button>
        </div>

        {/* Phone / Email */}
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

        {/* Lists membership */}
        {contactLists.length > 0 && (
          <div className="mx-4 mb-6">
            <p className="text-[13px] text-[#8E8E93] uppercase font-medium px-1 mb-1">Списки</p>
            <div className="bg-white rounded-[10px] overflow-hidden">
              {contactLists.map((list, idx) => (
                <div key={list.id}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#007AFF">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                    </svg>
                    <span className="text-[17px] text-[#1C1C1E]">{list.name}</span>
                  </div>
                  {idx < contactLists.length - 1 && (
                    <div className="ml-[52px] h-[0.5px] bg-[#C6C6C8]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {contact.notes && (
          <div className="mx-4 mb-6">
            <p className="text-[13px] text-[#8E8E93] uppercase font-medium px-1 mb-1">Заметки</p>
            <div className="bg-white rounded-[10px] px-4 py-3">
              <p className="text-[17px] text-[#1C1C1E] whitespace-pre-wrap leading-relaxed">
                {contact.notes}
              </p>
            </div>
          </div>
        )}

        {/* Delete */}
        <div className="mx-4 mb-8">
          <button
            onClick={handleDelete}
            className="w-full bg-white rounded-[10px] py-4 text-[#FF3B30] text-[17px] font-medium text-center touchable active:bg-[#F2F2F7]"
          >
            Удалить контакт
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-5 py-2.5 rounded-full text-[14px] pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  );
}
