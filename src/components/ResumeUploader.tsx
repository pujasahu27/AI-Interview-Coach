"use client";

import { useRef, useState } from "react";

export type UploaderValue =
  | { kind: "file"; file: File }
  | { kind: "text"; text: string }
  | null;

type Props = {
  label: string;
  accept: string;
  textPlaceholder: string;
  onChange: (value: UploaderValue) => void;
  disabled?: boolean;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionOf(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toUpperCase() : "FILE";
}

export function ResumeUploader({ label, accept, textPlaceholder, onChange, disabled }: Props) {
  const [tab, setTab] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedExts = accept.split(",").map((s) => s.trim().toLowerCase());

  function selectFile(next: File | null) {
    setFile(next);
    onChange(next ? { kind: "file", file: next } : null);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0];
    if (!dropped) return;
    const ext = `.${dropped.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedExts.includes(ext)) return;
    selectFile(dropped);
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-sub">{label}</span>
        <div className="flex gap-1 rounded-full border border-line2 p-1 text-xs">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setTab("file");
              onChange(file ? { kind: "file", file } : null);
            }}
            className={`rounded-full px-3 py-1 transition-all duration-200 ${
              tab === "file" ? "bg-gold text-on-accent" : "text-sub hover:text-foreground"
            }`}
          >
            Upload file
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setTab("text");
              onChange(null);
            }}
            className={`rounded-full px-3 py-1 transition-all duration-200 ${
              tab === "text" ? "bg-gold text-on-accent" : "text-sub hover:text-foreground"
            }`}
          >
            Paste text
          </button>
        </div>
      </div>

      {tab === "file" ? (
        file ? (
          <div className="animate-fade-in flex items-center gap-3.5 rounded-[16px] border border-gold/30 bg-gold-faint px-4 py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 font-mono text-[10px] font-bold text-gold">
              {extensionOf(file.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="font-mono text-[11px] text-muted">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => selectFile(null)}
              aria-label="Remove file"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sub transition hover:bg-line hover:text-coral"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              if (!disabled) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex w-full flex-col items-center gap-2.5 rounded-[16px] border border-dashed px-6 py-9 text-center transition-all duration-200 ${
              dragOver
                ? "scale-[1.01] border-gold bg-gold-faint"
                : "border-line2 bg-surface-elevated hover:border-gold/50 hover:bg-gold-faint/40"
            }`}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg transition ${
                dragOver ? "border-gold text-gold" : "border-line2 text-sub"
              }`}
            >
              ⇪
            </span>
            <span className="text-sm text-body">
              <span className="font-medium text-gold">Click to upload</span> or drag and drop
            </span>
            <span className="font-mono text-[11px] text-muted">{accept.replaceAll(",", " · ")}</span>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              disabled={disabled}
              onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
              className="hidden"
            />
          </button>
        )
      ) : (
        <textarea
          rows={6}
          disabled={disabled}
          placeholder={textPlaceholder}
          onChange={(event) => {
            const text = event.target.value;
            onChange(text.trim() ? { kind: "text", text } : null);
          }}
          className="w-full rounded-[16px] border border-line2 bg-surface-elevated px-3.5 py-2.5 text-sm leading-relaxed transition-colors focus:border-gold focus:outline-none"
        />
      )}
    </div>
  );
}
