"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, Contact } from "@/lib/supabase";
import SearchBar from "./SearchBar";
import ContactList from "./ContactList";
import ContactDetail from "./ContactDetail";
import ContactForm from "./ContactForm";

type View =
  | { type: "list" }
  | { type: "detail"; contact: Contact }
  | { type: "add" }
  | { type: "edit"; contact: Contact };

export default function ContactsApp() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>({ type: "list" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      setError("Ошибка загрузки контактов");
    } else {
      setContacts(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAdd = async (form: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  }) => {
    const { data, error } = await supabase
      .from("contacts")
      .insert([
        {
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          notes: form.notes.trim() || null,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setContacts((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name, "ru"))
      );
      setView({ type: "list" });
    }
  };

  const handleEdit = async (form: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  }) => {
    if (view.type !== "edit") return;
    const id = view.contact.id;

    const { data, error } = await supabase
      .from("contacts")
      .update({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      setContacts((prev) =>
        prev
          .map((c) => (c.id === id ? data : c))
          .sort((a, b) => a.name.localeCompare(b.name, "ru"))
      );
      setView({ type: "detail", contact: data });
    }
  };

  const handleDelete = async (contact: Contact) => {
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", contact.id);

    if (!error) {
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      setView({ type: "list" });
    }
  };

  // Render views
  if (view.type === "add") {
    return (
      <ContactForm
        onSave={handleAdd}
        onCancel={() => setView({ type: "list" })}
      />
    );
  }

  if (view.type === "edit") {
    return (
      <ContactForm
        initial={view.contact}
        onSave={handleEdit}
        onCancel={() => setView({ type: "detail", contact: view.contact })}
      />
    );
  }

  if (view.type === "detail") {
    return (
      <ContactDetail
        contact={view.contact}
        onEdit={() => setView({ type: "edit", contact: view.contact })}
        onDelete={() => handleDelete(view.contact)}
        onBack={() => {
          setSearch("");
          setView({ type: "list" });
        }}
      />
    );
  }

  // List view
  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7]">
      {/* Header */}
      <div className="bg-[#F2F2F7] pt-safe-top pt-12 px-4 pb-1">
        <div className="flex items-end justify-between mb-3">
          <h1 className="text-[34px] font-bold text-[#1C1C1E] leading-none">
            Контакты
          </h1>
          <button
            onClick={() => setView({ type: "add" })}
            className="w-[32px] h-[32px] bg-[#007AFF] rounded-full flex items-center justify-center touchable shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <div className="-mx-4">
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 px-8">
            <p className="text-[17px] text-[#FF3B30] text-center">{error}</p>
            <button
              onClick={fetchContacts}
              className="mt-4 text-[#007AFF] text-[17px] touchable"
            >
              Повторить
            </button>
          </div>
        ) : (
          <ContactList
            contacts={contacts}
            search={search}
            onSelect={(contact) => setView({ type: "detail", contact })}
          />
        )}
      </div>

      {/* Contact count */}
      {!loading && !error && !search && (
        <div className="text-center py-4 text-[#8E8E93] text-[14px]">
          {contacts.length}{" "}
          {contacts.length === 1
            ? "контакт"
            : contacts.length >= 2 && contacts.length <= 4
            ? "контакта"
            : "контактов"}
        </div>
      )}
    </div>
  );
}
