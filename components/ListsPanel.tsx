"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContactList } from "@/lib/supabase";

// ─── Sortable row ────────────────────────────────────────────────────────────

type RowProps = {
  list: ContactList;
  isActive: boolean;
  isEditing: boolean;
  editName: string;
  onEditNameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
};

function SortableRow({
  list,
  isActive,
  isEditing,
  editName,
  onEditNameChange,
  onRenameCommit,
  onRenameCancel,
  onStartEdit,
  onDelete,
  onSelect,
}: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center px-4 py-4 bg-white transition-shadow ${
        isDragging ? "opacity-40" : ""
      } ${isActive ? "bg-[#007AFF]/10" : ""}`}
    >
      {/* Drag handle — hold here to drag */}
      <div
        {...attributes}
        {...listeners}
        className="mr-3 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing"
      >
        <svg width="16" height="20" viewBox="0 0 16 20" fill="#C7C7CC">
          <circle cx="5" cy="4" r="1.5"/>
          <circle cx="5" cy="10" r="1.5"/>
          <circle cx="5" cy="16" r="1.5"/>
          <circle cx="11" cy="4" r="1.5"/>
          <circle cx="11" cy="10" r="1.5"/>
          <circle cx="11" cy="16" r="1.5"/>
        </svg>
      </div>

      {isEditing ? (
        <input
          autoFocus
          value={editName}
          onChange={(e) => onEditNameChange(e.target.value)}
          onBlur={onRenameCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRenameCommit();
            if (e.key === "Escape") onRenameCancel();
          }}
          className="flex-1 bg-[#F2F2F7] rounded-lg px-3 py-1.5 text-[17px] text-[#1C1C1E] outline-none"
        />
      ) : (
        <button
          onClick={onSelect}
          className="flex-1 flex items-center text-left touchable"
        >
          <span className={`text-[17px] ${isActive ? "text-[#007AFF] font-semibold" : "text-[#1C1C1E]"}`}>
            {list.name}
          </span>
        </button>
      )}

      <div className="flex items-center gap-1 ml-2">
        {isActive && !isEditing && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#007AFF" className="mr-1">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        )}
        {!isEditing && (
          <>
            <button onClick={onStartEdit} className="p-1.5 touchable">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#8E8E93">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button onClick={onDelete} className="p-1.5 touchable">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#FF3B30">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Ghost card shown under the finger while dragging ───────────────────────

function DragGhost({ list }: { list: ContactList }) {
  return (
    <div className="flex items-center px-4 py-4 bg-white rounded-[10px] shadow-2xl opacity-95">
      <div className="mr-3">
        <svg width="16" height="20" viewBox="0 0 16 20" fill="#C7C7CC">
          <circle cx="5" cy="4" r="1.5"/><circle cx="5" cy="10" r="1.5"/><circle cx="5" cy="16" r="1.5"/>
          <circle cx="11" cy="4" r="1.5"/><circle cx="11" cy="10" r="1.5"/><circle cx="11" cy="16" r="1.5"/>
        </svg>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#8E8E93" className="mr-3">
        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
      </svg>
      <span className="text-[17px] text-[#1C1C1E]">{list.name}</span>
    </div>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

type Props = {
  lists: ContactList[];
  activeListId: string | null;
  onSelectList: (id: string | null) => void;
  onCreateList: (name: string) => Promise<ContactList | null>;
  onRenameList: (id: string, name: string) => Promise<void>;
  onDeleteList: (id: string) => Promise<void>;
  onReorder: (newLists: ContactList[]) => Promise<void>;
  onClose: () => void;
};

export default function ListsPanel({
  lists,
  activeListId,
  onSelectList,
  onCreateList,
  onRenameList,
  onDeleteList,
  onReorder,
  onClose,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // 300 ms hold before drag starts — works for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 300, tolerance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 8 },
    })
  );

  const handleDragStart = (e: DragStartEvent) => {
    setDraggingId(String(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setDraggingId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = lists.findIndex((l) => l.id === active.id);
    const newIdx = lists.findIndex((l) => l.id === over.id);
    onReorder(arrayMove(lists, oldIdx, newIdx));
  };

  const handleRenameCommit = async (id: string) => {
    const name = editName.trim();
    if (name) await onRenameList(id, name);
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

  const draggingList = lists.find((l) => l.id === draggingId) ?? null;

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

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
          {/* All contacts */}
          <div className="bg-white rounded-[10px] overflow-hidden">
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

          {/* Sortable list */}
          {lists.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={lists.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="bg-white rounded-[10px] overflow-hidden">
                  {lists.map((list, idx) => (
                    <div key={list.id}>
                      <SortableRow
                        list={list}
                        isActive={activeListId === list.id}
                        isEditing={editingId === list.id}
                        editName={editName}
                        onEditNameChange={setEditName}
                        onRenameCommit={() => handleRenameCommit(list.id)}
                        onRenameCancel={() => setEditingId(null)}
                        onStartEdit={() => { setEditingId(list.id); setEditName(list.name); }}
                        onDelete={() => { if (confirm(`Удалить список «${list.name}»?`)) onDeleteList(list.id); }}
                        onSelect={() => { onSelectList(list.id); onClose(); }}
                      />
                      {idx < lists.length - 1 && (
                        <div className="h-[0.5px] bg-[#C6C6C8] ml-[52px]" />
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>

              {/* Ghost card under finger */}
              <DragOverlay>
                {draggingList && <DragGhost list={draggingList} />}
              </DragOverlay>
            </DndContext>
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
