"use client";

import { useRef, useState } from "react";
import { Contact, ContactList } from "@/lib/supabase";
import StarRating from "./StarRating";

export type FormData = {
  name: string;
  phone: string;
  email: string;
  notes: string;
  photo: string;
  rating: number;
  listIds: string[];
};

type Props = {
  initial?: Contact;
  initialListIds?: string[];
  lists?: ContactList[];
  onSave: (data: FormData) => Promise<string | null>; // returns error message or null
  onCancel: () => void;
  onCreateList?: (name: string) => Promise<ContactList | null>;
};

export default function ContactForm({
  initial,
  initialListIds = [],
  lists = [],
  onSave,
  onCancel,
  onCreateList,
}: Props) {
  const [form, setForm] = useState<FormData>({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    notes: initial?.notes ?? "",
    photo: initial?.photo ?? "",
    rating: initial?.rating ?? 0,
    listIds: initialListIds,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContactPicker =
    typeof window !== "undefined" &&
    "contacts" in navigator &&
    "ContactsManager" in window;

  // --- Photo ---
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 256;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setForm((prev) => ({ ...prev, photo: canvas.toDataURL("image/jpeg", 0.82) }));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // --- Import from device contacts ---
  const handleImport = async () => {
    if (!hasContactPicker) return;
    try {
      setImporting(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = await (navigator as any).contacts.select(
        ["name", "tel", "email"],
        { multiple: false }
      );
      if (results?.length > 0) {
        const c = results[0];
        setForm((prev) => ({
          ...prev,
          name: c.name?.[0] ?? prev.name,
          phone: c.tel?.[0] ?? prev.phone,
          email: c.email?.[0] ?? prev.email,
        }));
      }
    } catch {
      // cancelled
    } finally {
      setImporting(false);
    }
  };

  // --- List toggle ---
  const toggleList = (listId: string) => {
    setForm((prev) => ({
      ...prev,
      listIds: prev.listIds.includes(listId)
        ? prev.listIds.filter((id) => id !== listId)
        : [...prev.listIds, listId],
    }));
  };

  // --- Create new list inline ---
  const handleCreateList = async () => {
    const name = newListName.trim();
    if (!name || !onCreateList) return;
    setCreatingList(true);
    const created = await onCreateList(name);
    setCreatingList(false);
    setNewListName("");
    setShowNewList(false);
    // Auto-select the newly created list
    if (created) {
      setForm((prev) => ({ ...prev, listIds: [...prev.listIds, created.id] }));
    }
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setErrors({ name: "Введите имя" });
      return;
    }
    setSaving(true);
    const err = await onSave(form);
    setSaving(false);
    if (err) setErrors({ save: err });
  };

  const fields = [
    { key: "name" as const, label: "Имя", placeholder: "Имя", type: "text", autoComplete: "name" },
    { key: "phone" as const, label: "Телефон", placeholder: "+7 (___) ___-__-__", type: "tel", autoComplete: "tel" },
    { key: "email" as const, label: "Email", placeholder: "example@mail.ru", type: "email", autoComplete: "email" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7]">
      {/* Navigation bar */}
      <div className="flex items-center justify-between px-4 pt-safe-top pt-4 pb-2 bg-[#F2F2F7]">
        <button onClick={onCancel} className="text-[#007AFF] text-[17px] touchable">
          Отмена
        </button>
        <h1 className="text-[17px] font-semibold text-[#1C1C1E]">
          {initial ? "Редактировать" : "Новый контакт"}
        </h1>
        <button
          onClick={handleSubmit}
          disabled={saving || !form.name.trim()}
          className="text-[17px] font-semibold touchable disabled:opacity-40"
          style={{ color: form.name.trim() ? "#007AFF" : "#8E8E93" }}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          ) : (
            "Готово"
          )}
        </button>
      </div>

      {errors.save && (
        <div className="mx-4 mt-2 px-4 py-3 bg-[#FF3B30]/10 rounded-[10px]">
          <p className="text-[14px] text-[#FF3B30]">{errors.save}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Avatar / Photo */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            {form.photo ? (
              <img
                src={form.photo}
                alt="Фото"
                className="w-[88px] h-[88px] rounded-full object-cover"
              />
            ) : (
              <div className="w-[88px] h-[88px] rounded-full bg-[#C7C7CC] flex items-center justify-center">
                {form.name ? (
                  <span className="text-white text-[32px] font-semibold">
                    {form.name[0].toUpperCase()}
                  </span>
                ) : (
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
            )}
            {/* Camera badge */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#007AFF] rounded-full flex items-center justify-center shadow touchable"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 15.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm7-11.2h-1.4L16 2H8L6.4 4H5A3 3 0 0 0 2 7v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3z"/>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[#007AFF] text-[14px] touchable"
            >
              {form.photo ? "Изменить фото" : "Добавить фото"}
            </button>
            {form.photo && (
              <button
                onClick={() => setForm((prev) => ({ ...prev, photo: "" }))}
                className="text-[#FF3B30] text-[14px] touchable"
              >
                Удалить
              </button>
            )}
          </div>

          {hasContactPicker && !initial && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-1.5 text-[#007AFF] text-[14px] mt-1 touchable disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#007AFF">
                <path d="M20 0H4C2.9 0 2 .9 2 2v18l4-4h14c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm-9 11H9V9h2V7h2v2h2v2h-2v2h-2v-2z"/>
              </svg>
              {importing ? "Загрузка..." : "Импорт из контактов"}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* Main fields */}
        <div className="bg-white rounded-[10px] overflow-hidden">
          {fields.map((field, idx) => (
            <div key={field.key}>
              <div className="px-4 py-3 flex items-center gap-3">
                <span className="text-[15px] text-[#8E8E93] w-[72px] flex-shrink-0">
                  {field.label}
                </span>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) => {
                    setForm({ ...form, [field.key]: e.target.value });
                    if (errors[field.key]) setErrors({ ...errors, [field.key]: "" });
                  }}
                  autoComplete={field.autoComplete}
                  className="flex-1 bg-transparent outline-none text-[17px] text-[#1C1C1E] placeholder-[#C7C7CC]"
                />
              </div>
              {errors[field.key] && (
                <p className="px-4 pb-2 text-[12px] text-[#FF3B30]">{errors[field.key]}</p>
              )}
              {idx < fields.length - 1 && <div className="ml-[100px] h-[0.5px] bg-[#C6C6C8]" />}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <p className="text-[13px] text-[#8E8E93] uppercase font-medium px-1 mb-1">Заметки</p>
          <div className="bg-white rounded-[10px] px-4 py-3">
            <textarea
              placeholder="Добавить заметку..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              className="w-full bg-transparent outline-none text-[17px] text-[#1C1C1E] placeholder-[#C7C7CC] resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <p className="text-[13px] text-[#8E8E93] uppercase font-medium px-1 mb-1">Рейтинг</p>
          <div className="bg-white rounded-[10px] px-4 py-4 flex items-center justify-between">
            <span className="text-[17px] text-[#1C1C1E]">
              {form.rating === 0 ? "Без рейтинга" : `${form.rating} из 3`}
            </span>
            <StarRating
              value={form.rating}
              onChange={(v) => setForm((prev) => ({ ...prev, rating: v }))}
              size={28}
            />
          </div>
        </div>

        {/* Lists */}
        <div>
          <p className="text-[13px] text-[#8E8E93] uppercase font-medium px-1 mb-1">Списки</p>
          <div className="bg-white rounded-[10px] overflow-hidden">
            {lists.map((list, idx) => {
              const isSelected = form.listIds.includes(list.id);
              return (
                <div key={list.id}>
                  <button
                    onClick={() => toggleList(list.id)}
                    className="w-full flex items-center justify-between px-4 py-4 touchable active:bg-[#F2F2F7]"
                  >
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isSelected ? "#007AFF" : "#C7C7CC"}>
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                      </svg>
                      <span className={`text-[17px] ${isSelected ? "text-[#007AFF]" : "text-[#1C1C1E]"}`}>
                        {list.name}
                      </span>
                    </div>
                    {isSelected && (
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

            {/* Separator before new-list row */}
            {lists.length > 0 && <div className="h-[0.5px] bg-[#C6C6C8] ml-4" />}

            {/* Create new list row */}
            {showNewList ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#007AFF">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <input
                  autoFocus
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateList();
                    if (e.key === "Escape") { setShowNewList(false); setNewListName(""); }
                  }}
                  placeholder="Название списка"
                  disabled={creatingList}
                  className="flex-1 bg-transparent outline-none text-[17px] text-[#1C1C1E] placeholder-[#C7C7CC]"
                />
                <button
                  onClick={handleCreateList}
                  disabled={!newListName.trim() || creatingList}
                  className="text-[#007AFF] text-[15px] font-semibold touchable disabled:opacity-40"
                >
                  {creatingList ? "..." : "Создать"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewList(true)}
                className="w-full flex items-center gap-3 px-4 py-4 touchable active:bg-[#F2F2F7]"
              >
                <div className="w-5 h-5 bg-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </div>
                <span className="text-[17px] text-[#007AFF]">Новый список</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
