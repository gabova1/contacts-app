"use client";

import { useState } from "react";
import { Contact } from "@/lib/supabase";

type FormData = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

type Props = {
  initial?: Contact;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
};

export default function ContactForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormData>({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    notes: initial?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Введите имя";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const fields = [
    {
      key: "name" as const,
      label: "Имя",
      placeholder: "Имя",
      type: "text",
      required: true,
      autoComplete: "name",
    },
    {
      key: "phone" as const,
      label: "Телефон",
      placeholder: "+7 (___) ___-__-__",
      type: "tel",
      required: false,
      autoComplete: "tel",
    },
    {
      key: "email" as const,
      label: "Email",
      placeholder: "example@mail.ru",
      type: "email",
      required: false,
      autoComplete: "email",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7]">
      {/* Navigation bar */}
      <div className="flex items-center justify-between px-4 pt-safe-top pt-4 pb-2 bg-[#F2F2F7]">
        <button
          onClick={onCancel}
          className="text-[#007AFF] text-[17px] touchable"
        >
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

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Avatar section */}
        <div className="flex flex-col items-center py-4">
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
          <button className="text-[#007AFF] text-[14px] mt-2 touchable">
            Добавить фото
          </button>
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
                <p className="px-4 pb-2 text-[12px] text-[#FF3B30]">
                  {errors[field.key]}
                </p>
              )}
              {idx < fields.length - 1 && (
                <div className="ml-[100px] h-[0.5px] bg-[#C6C6C8]" />
              )}
            </div>
          ))}
        </div>

        {/* Notes field */}
        <div>
          <p className="text-[13px] text-[#8E8E93] uppercase font-medium px-1 mb-1">
            Заметки
          </p>
          <div className="bg-white rounded-[10px] px-4 py-3">
            <textarea
              placeholder="Добавить заметку..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={5}
              className="w-full bg-transparent outline-none text-[17px] text-[#1C1C1E] placeholder-[#C7C7CC] resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
