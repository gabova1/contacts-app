"use client";

import { useMemo } from "react";
import { Contact } from "@/lib/supabase";
import ContactItem from "./ContactItem";

export type SortBy = "alpha" | "date" | "rating";

type GroupedContacts = { letter: string; contacts: Contact[] };

function groupAlpha(contacts: Contact[]): GroupedContacts[] {
  const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name, "ru"));
  const groups: Record<string, Contact[]> = {};
  for (const c of sorted) {
    const letter = c.name[0].toUpperCase();
    const key = /[А-ЯЁA-Z]/.test(letter) ? letter : "#";
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b, "ru"))
    .map(([letter, contacts]) => ({ letter, contacts }));
}

type Props = {
  contacts: Contact[];
  search: string;
  sortBy: SortBy;
  onSelect: (contact: Contact) => void;
};

export default function ContactList({ contacts, search, sortBy, onSelect }: Props) {
  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const sorted = useMemo(() => {
    if (sortBy === "date") {
      return [...filtered].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    if (sortBy === "rating") {
      return [...filtered].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name, "ru"));
    }
    return filtered; // alpha: grouped below
  }, [filtered, sortBy]);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8">
        <div className="w-16 h-16 bg-[#8E8E93]/20 rounded-full flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-[17px] text-[#8E8E93] text-center">
          {search ? "Контактов не найдено" : "Нет контактов"}
        </p>
        {!search && (
          <p className="text-[14px] text-[#C6C6C8] text-center mt-1">
            Нажмите + чтобы добавить контакт
          </p>
        )}
      </div>
    );
  }

  // Flat list (date / rating sort)
  if (sortBy !== "alpha") {
    return (
      <div className="pb-8">
        <div className="bg-white">
          {sorted.map((contact, idx) => (
            <div key={contact.id} className="relative">
              <ContactItem contact={contact} onClick={onSelect} isLast={idx === sorted.length - 1} />
              {idx < sorted.length - 1 && (
                <div className="absolute left-[72px] right-0 bottom-0 h-[0.5px] bg-[#C6C6C8] pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Alphabetical grouped list
  const groups = groupAlpha(filtered);
  return (
    <div className="pb-8">
      {groups.map((group) => (
        <div key={group.letter}>
          <div className="px-4 py-1 bg-[#F2F2F7] sticky top-0 z-10">
            <span className="text-[13px] font-semibold text-[#8E8E93]">{group.letter}</span>
          </div>
          <div className="bg-white">
            {group.contacts.map((contact, idx) => (
              <div key={contact.id} className="relative">
                <ContactItem
                  contact={contact}
                  onClick={onSelect}
                  isLast={idx === group.contacts.length - 1}
                />
                {idx < group.contacts.length - 1 && (
                  <div className="absolute left-[72px] right-0 bottom-0 h-[0.5px] bg-[#C6C6C8] pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
