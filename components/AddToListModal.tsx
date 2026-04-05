"use client";

import { useState } from "react";
import { Contact, ContactList } from "@/lib/supabase";

type Props = {
  contact: Contact;
  lists: ContactList[];
  contactListIds: string[];
  onToggle: (listId: string) => Promise<void>;
  onClose: () => void;
  onCreateList: (name: string) => Promise<void>;
};

export default function AddToListModal({
  contact,
  lists,
  contactListIds,
  onToggle,
  onClose,
  onCreateList,
}: Props) {
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleToggle = async (listId: string) => {
    setSaving(true);
    await onToggle(listId);
    setSaving(false);
  };

  const handleCreate = async () => {
    const name = newListName.trim();
    if (!name) return;
    setSaving(true);
    await onCreateList(name);
    setSaving(false);
    setNewListName("");
    setShowNewList(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="relative w-full bg-[#F2F2F7] rounded-t-[20px] pb-safe-bottom pb-8 max-h-[80vh] flex flex-col shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#C7C7CC] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-[18px] font-semibold text-[#1C1C1E]">
            Добавить в список
          </h2>
          <button onClick={onClose} className="text-[#007AFF] text-[17px] touchable">
            Готово
          </button>
        </div>

        <p className="px-4 pb-2 text-[14px] text-[#8E8E93]">{contact.name}</p>

        <div className="flex-1 overflow-y-auto px-4 space-y-3">
          {/* Lists */}
          {lists.length > 0 && (
            <div className="bg-white rounded-[10px] overflow-hidden">
              {lists.map((list, idx) => {
                const isIn = contactListIds.includes(list.id);
                return (
                  <div key={list.id}>
                    <button
                      onClick={() => handleToggle(list.id)}
                      disabled={saving}
                      className="w-full flex items-center justify-between px-4 py-4 touchable active:bg-[#F2F2F7] disabled:opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={isIn ? "#007AFF" : "#C7C7CC"}>
                          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                        </svg>
                        <span className="text-[17px] text-[#1C1C1E]">{list.name}</span>
                      </div>
                      {isIn && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#007AFF">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </button>
                    {idx < lists.length - 1 && (
                      <div className="h-[0.5px] bg-[#C6C6C8] ml-[52px]" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* New list */}
          {showNewList ? (
            <div className="bg-white rounded-[10px] overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#007AFF">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <input
                  autoFocus
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") { setShowNewList(false); setNewListName(""); }
                  }}
                  placeholder="Название списка"
                  className="flex-1 bg-transparent outline-none text-[17px] text-[#1C1C1E] placeholder-[#C7C7CC]"
                  disabled={saving}
                />
                <button
                  onClick={handleCreate}
                  disabled={!newListName.trim() || saving}
                  className="text-[#007AFF] text-[15px] font-semibold touchable disabled:opacity-40"
                >
                  Создать
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewList(true)}
              className="w-full bg-white rounded-[10px] py-4 text-[#007AFF] text-[17px] font-medium flex items-center justify-center gap-2 touchable"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#007AFF">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Новый список
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
