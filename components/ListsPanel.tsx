"use client";

import { useState } from "react";
import { ContactList } from "@/lib/supabase";

type Props = {
  lists: ContactList[];
  activeListId: string | null;
  onSelectList: (id: string | null) => void;
  onCreateList: (name: string) => Promise<void>;
  onRenameList: (id: string, name: string) => Promise<void>;
  onDeleteList: (id: string) => Promise<void>;
  onClose: () => void;
};

export default function ListsPanel({
  lists,
  activeListId,
  onSelectList,
  onCreateList,
  onRenameList,
  onDeleteList,
  onClose,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleRename = async (id: string) => {
    const name = editName.trim();
    if (name) {
      setSaving(true);
      await onRenameList(id, name);
      setSaving(false);
    }
    setEditingId(null);
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
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-[300px] max-w-[85vw] bg-[#F2F2F7] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-safe-top pt-12 pb-4">
          <h2 className="text-[22px] font-bold text-[#1C1C1E]">Группы</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#C7C7CC] rounded-full flex items-center justify-center touchable"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="#636366" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {/* All contacts row */}
          <div className="bg-white rounded-[10px] overflow-hidden mb-3">
            <button
              onClick={() => { onSelectList(null); onClose(); }}
              className={`w-full flex items-center justify-between px-4 py-4 touchable ${activeListId === null ? "bg-[#007AFF]/10" : ""}`}
            >
              <div className="flex items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill={activeListId === null ? "#007AFF" : "#8E8E93"}>
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <span className={`text-[17px] ${activeListId === null ? "text-[#007AFF] font-semibold" : "text-[#1C1C1E]"}`}>
                  Все контакты
                </span>
              </div>
              {activeListId === null && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#007AFF">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </button>
          </div>

          {/* Custom lists */}
          {lists.length > 0 && (
            <div className="bg-white rounded-[10px] overflow-hidden mb-3">
              {lists.map((list, idx) => (
                <div key={list.id}>
                  {editingId === list.id ? (
                    <div className="flex items-center gap-2 px-4 py-3">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => handleRename(list.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(list.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1 bg-[#F2F2F7] rounded-lg px-3 py-2 text-[17px] text-[#1C1C1E] outline-none"
                        disabled={saving}
                      />
                    </div>
                  ) : (
                    <div className={`flex items-center px-4 py-4 ${activeListId === list.id ? "bg-[#007AFF]/10" : ""}`}>
                      <button
                        onClick={() => { onSelectList(list.id); onClose(); }}
                        className="flex-1 flex items-center gap-3 touchable text-left"
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill={activeListId === list.id ? "#007AFF" : "#8E8E93"}>
                          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                        </svg>
                        <span className={`text-[17px] flex-1 ${activeListId === list.id ? "text-[#007AFF] font-semibold" : "text-[#1C1C1E]"}`}>
                          {list.name}
                        </span>
                      </button>
                      <div className="flex items-center gap-1">
                        {activeListId === list.id && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#007AFF" className="mr-1">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        )}
                        <button
                          onClick={() => { setEditingId(list.id); setEditName(list.name); }}
                          className="p-2 touchable"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#8E8E93">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Удалить список «${list.name}»?`)) {
                              onDeleteList(list.id);
                            }
                          }}
                          className="p-2 touchable"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF3B30">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  {idx < lists.length - 1 && (
                    <div className="h-[0.5px] bg-[#C6C6C8] ml-4" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* New list input */}
          {showNewList ? (
            <div className="bg-white rounded-[10px] overflow-hidden mb-3">
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
                  Добавить
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
