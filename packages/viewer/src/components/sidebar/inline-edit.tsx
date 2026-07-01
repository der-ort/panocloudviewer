"use client";

import React, { useState, useRef, useEffect } from "react";

interface InlineEditProps {
  /** Current text. */
  value: string;
  /** Called with the trimmed new value when it changed (never with an empty string). */
  onSave: (next: string) => void;
  /** Which gesture enters edit mode. Default `"click"`. */
  activateOn?: "click" | "dblclick";
  /** Classes for the read-only display element. */
  displayClassName?: string;
  /** Classes for the `<input>` shown while editing. */
  inputClassName?: string;
  /** Tooltip on the display element. */
  title?: string;
}

/**
 * A label that turns into a text input on click/double-click and commits on
 * Enter or blur (Escape cancels). Shared by the measurements and scenes panels
 * so their rename UX stays identical.
 */
export function InlineEdit({
  value,
  onSave,
  activateOn = "click",
  displayClassName,
  inputClassName,
  title,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const begin = () => { setDraft(value); setEditing(true); };
  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  };

  if (!editing) {
    return (
      <p
        className={displayClassName}
        onClick={activateOn === "click" ? begin : undefined}
        onDoubleClick={activateOn === "dblclick" ? begin : undefined}
        title={title}
      >
        {value}
      </p>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
      onBlur={save}
      className={inputClassName}
    />
  );
}
