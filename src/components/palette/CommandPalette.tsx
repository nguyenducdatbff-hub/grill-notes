"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { SearchDialog } from "@/components/search/SearchDialog";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function newNote() {
    const res = await fetch("/api/notes", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    const note = await res.json();
    router.push(`/app/notes/${note.id}`);
  }

  return (
    <>
      <Command.Dialog open={open} onOpenChange={setOpen} label="Commands">
        <Command.Input placeholder="Type a command…" autoFocus />
        <Command.List>
          <Command.Item onSelect={newNote}>New note</Command.Item>
          <Command.Item onSelect={() => { setOpen(false); setSearchOpen(true); }}>Search notes…</Command.Item>
          <Command.Item onSelect={() => { router.push("/app/graph"); setOpen(false); }}>Open knowledge graph</Command.Item>
          <Command.Item onSelect={() => { router.push("/app/digest"); setOpen(false); }}>Open daily digest</Command.Item>
          <Command.Item onSelect={() => { router.push("/app/focus"); setOpen(false); }}>Open focus</Command.Item>
          <Command.Item onSelect={() => { router.push("/app/templates"); setOpen(false); }}>Open templates</Command.Item>
          <Command.Item onSelect={() => { router.push("/app/settings"); setOpen(false); }}>Open settings</Command.Item>
          <Command.Item onSelect={() => { document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; setOpen(false); }}>
            Toggle theme
          </Command.Item>
        </Command.List>
      </Command.Dialog>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
