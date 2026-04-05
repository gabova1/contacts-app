"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase, Contact, ContactList, ContactListAssignment } from "@/lib/supabase";
import { FormData } from "./ContactForm";
import SearchBar from "./SearchBar";
import ContactListView from "./ContactList";
import ContactDetail from "./ContactDetail";
import ContactForm from "./ContactForm";
import ListsPanel from "./ListsPanel";
import AddToListModal from "./AddToListModal";

type View =
  | { type: "list" }
  | { type: "detail"; contact: Contact }
  | { type: "add" }
  | { type: "edit"; contact: Contact };

export default function ContactsApp() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [assignments, setAssignments] = useState<ContactListAssignment[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>({ type: "list" });
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showListsPanel, setShowListsPanel] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [contactsRes, listsRes, assignmentsRes] = await Promise.all([
      supabase.from("contacts").select("*").order("name", { ascending: true }),
      supabase.from("lists").select("*").order("order", { ascending: true }).order("created_at", { ascending: true }),
      supabase.from("contact_lists").select("*"),
    ]);

    if (contactsRes.error) {
      setError("Ошибка загрузки контактов");
    } else {
      setContacts(contactsRes.data ?? []);
      setLists(listsRes.data ?? []);
      setAssignments(assignmentsRes.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Contacts filtered by active list (search handled inside ContactListView)
  const contactsInActiveList = useMemo(() => {
    if (!activeListId) return contacts;
    const ids = new Set(
      assignments.filter((a) => a.list_id === activeListId).map((a) => a.contact_id)
    );
    return contacts.filter((c) => ids.has(c.id));
  }, [contacts, assignments, activeListId]);

  const getContactListIds = (contactId: string) =>
    assignments.filter((a) => a.contact_id === contactId).map((a) => a.list_id);

  // --- Contact CRUD ---
  const handleAdd = async (form: FormData) => {
    const { data, error } = await supabase
      .from("contacts")
      .insert([{
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
        photo: form.photo || null,
      }])
      .select()
      .single();

    if (!error && data) {
      setContacts((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name, "ru")));
      // Assign to selected lists
      if (form.listIds.length > 0) {
        const rows = form.listIds.map((list_id) => ({ contact_id: data.id, list_id }));
        await supabase.from("contact_lists").insert(rows);
        setAssignments((prev) => [...prev, ...rows]);
      }
      setView({ type: "list" });
    }
  };

  const handleEdit = async (form: FormData) => {
    if (view.type !== "edit") return;
    const id = view.contact.id;

    const { data, error } = await supabase
      .from("contacts")
      .update({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
        photo: form.photo || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? data : c)).sort((a, b) => a.name.localeCompare(b.name, "ru"))
      );
      // Sync list assignments: remove old, add new
      const oldIds = assignments.filter((a) => a.contact_id === id).map((a) => a.list_id);
      const toAdd = form.listIds.filter((lid) => !oldIds.includes(lid));
      const toRemove = oldIds.filter((lid) => !form.listIds.includes(lid));
      if (toRemove.length > 0) {
        await supabase.from("contact_lists").delete().eq("contact_id", id).in("list_id", toRemove);
        setAssignments((prev) =>
          prev.filter((a) => !(a.contact_id === id && toRemove.includes(a.list_id)))
        );
      }
      if (toAdd.length > 0) {
        const rows = toAdd.map((list_id) => ({ contact_id: id, list_id }));
        await supabase.from("contact_lists").insert(rows);
        setAssignments((prev) => [...prev, ...rows]);
      }
      setView({ type: "detail", contact: data });
    }
  };

  const handleDelete = async (contact: Contact) => {
    const { error } = await supabase.from("contacts").delete().eq("id", contact.id);
    if (!error) {
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      setAssignments((prev) => prev.filter((a) => a.contact_id !== contact.id));
      setView({ type: "list" });
    }
  };

  // --- List CRUD ---
  const handleCreateList = async (name: string): Promise<ContactList | null> => {
    const nextOrder = lists.length;
    const { data, error } = await supabase.from("lists").insert([{ name, order: nextOrder }]).select().single();
    if (!error && data) {
      setLists((prev) => [...prev, data]);
      return data;
    }
    return null;
  };

  const handleReorderLists = async (newLists: ContactList[]) => {
    setLists(newLists); // optimistic
    await Promise.all(
      newLists.map((list, idx) =>
        supabase.from("lists").update({ order: idx }).eq("id", list.id)
      )
    );
  };

  const handleRenameList = async (id: string, name: string) => {
    const { data, error } = await supabase.from("lists").update({ name }).eq("id", id).select().single();
    if (!error && data) {
      setLists((prev) => prev.map((l) => (l.id === id ? data : l)));
    }
  };

  const handleDeleteList = async (id: string) => {
    const { error } = await supabase.from("lists").delete().eq("id", id);
    if (!error) {
      setLists((prev) => prev.filter((l) => l.id !== id));
      setAssignments((prev) => prev.filter((a) => a.list_id !== id));
      if (activeListId === id) setActiveListId(null);
    }
  };

  // --- List assignments ---
  const handleToggleContactInList = async (contactId: string, listId: string) => {
    const isIn = assignments.some((a) => a.contact_id === contactId && a.list_id === listId);
    if (isIn) {
      await supabase.from("contact_lists").delete().eq("contact_id", contactId).eq("list_id", listId);
      setAssignments((prev) => prev.filter((a) => !(a.contact_id === contactId && a.list_id === listId)));
    } else {
      await supabase.from("contact_lists").insert([{ contact_id: contactId, list_id: listId }]);
      setAssignments((prev) => [...prev, { contact_id: contactId, list_id: listId }]);
    }
  };

  const activeList = lists.find((l) => l.id === activeListId) ?? null;

  // --- Views ---
  if (view.type === "add") {
    return (
      <ContactForm
        lists={lists}
        onSave={handleAdd}
        onCancel={() => setView({ type: "list" })}
        onCreateList={handleCreateList}
      />
    );
  }

  if (view.type === "edit") {
    return (
      <ContactForm
        initial={view.contact}
        initialListIds={getContactListIds(view.contact.id)}
        lists={lists}
        onSave={handleEdit}
        onCancel={() => setView({ type: "detail", contact: view.contact })}
        onCreateList={handleCreateList}
      />
    );
  }

  if (view.type === "detail") {
    const freshContact = contacts.find((c) => c.id === view.contact.id) ?? view.contact;
    return (
      <>
        <ContactDetail
          contact={freshContact}
          contactListIds={getContactListIds(freshContact.id)}
          lists={lists}
          onEdit={() => setView({ type: "edit", contact: freshContact })}
          onDelete={() => handleDelete(freshContact)}
          onBack={() => { setSearch(""); setView({ type: "list" }); }}
          onAddToList={() => setShowAddToList(true)}
        />
        {showAddToList && (
          <AddToListModal
            contact={freshContact}
            lists={lists}
            contactListIds={getContactListIds(freshContact.id)}
            onToggle={(listId) => handleToggleContactInList(freshContact.id, listId)}
            onClose={() => setShowAddToList(false)}
            onCreateList={handleCreateList}
          />
        )}
      </>
    );
  }

  // --- List view ---
  return (
    <>
      <div className="flex flex-col min-h-screen bg-[#F2F2F7]">
        {/* Header */}
        <div className="bg-[#F2F2F7] pt-safe-top pt-12 px-4 pb-1">
          <div className="flex items-end justify-between mb-3">
            <div>
              <button
                onClick={() => setShowListsPanel(true)}
                className="flex items-center gap-1 text-[#007AFF] touchable mb-0.5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#007AFF">
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                </svg>
                <span className="text-[15px] font-medium">Группы</span>
              </button>
              <h1 className="text-[34px] font-bold text-[#1C1C1E] leading-none">
                {activeList ? activeList.name : "Контакты"}
              </h1>
            </div>
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
              <button onClick={fetchAll} className="mt-4 text-[#007AFF] text-[17px] touchable">
                Повторить
              </button>
            </div>
          ) : (
            <ContactListView
              contacts={contactsInActiveList}
              search={search}
              onSelect={(contact) => setView({ type: "detail", contact })}
            />
          )}
        </div>

        {/* Contact count */}
        {!loading && !error && !search && (
          <div className="text-center py-4 text-[#8E8E93] text-[14px]">
            {contactsInActiveList.length}{" "}
            {contactsInActiveList.length === 1
              ? "контакт"
              : contactsInActiveList.length >= 2 && contactsInActiveList.length <= 4
              ? "контакта"
              : "контактов"}
          </div>
        )}
      </div>

      {/* Lists panel */}
      {showListsPanel && (
        <ListsPanel
          lists={lists}
          activeListId={activeListId}
          onSelectList={(id) => { setActiveListId(id); setSearch(""); }}
          onCreateList={handleCreateList}
          onRenameList={handleRenameList}
          onDeleteList={handleDeleteList}
          onReorder={handleReorderLists}
          onClose={() => setShowListsPanel(false)}
        />
      )}
    </>
  );
}
