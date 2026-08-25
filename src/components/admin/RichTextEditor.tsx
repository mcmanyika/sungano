"use client";

import {
  Bold,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isEmptyHtml } from "@/lib/email/html-text";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="rounded-lg p-2 text-neutral-600 transition hover:bg-white hover:text-primary"
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Write your update here.",
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    document.execCommand("defaultParagraphSeparator", false, "p");

    if (document.activeElement !== editor && editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  function emit() {
    const html = editorRef.current?.innerHTML ?? "";
    onChange(isEmptyHtml(html) ? "" : html);
  }

  function run(command: string, argument?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    emit();
  }

  function addLink() {
    const url = window.prompt("Link URL", "https://");
    if (!url?.trim()) {
      return;
    }
    run("createLink", url.trim());
  }

  const showPlaceholder = isEmptyHtml(value) && !focused;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-neutral-200 bg-white transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div className="flex flex-wrap gap-0.5 border-b border-neutral-200 bg-neutral-50/90 px-1.5 py-1.5">
        <ToolbarButton label="Bold" onClick={() => run("bold")}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => run("italic")}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Underline" onClick={() => run("underline")}>
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 my-1 w-px bg-neutral-200" />
        <ToolbarButton label="Heading" onClick={() => run("formatBlock", "h2")}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Bulleted list" onClick={() => run("insertUnorderedList")}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => run("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Link" onClick={addLink}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="relative">
        {showPlaceholder ? (
          <p className="pointer-events-none absolute inset-x-4 top-3 text-sm text-neutral-400">
            {placeholder}
          </p>
        ) : null}
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-label="Message"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={emit}
          onBlur={() => {
            setFocused(false);
            emit();
          }}
          onFocus={() => setFocused(true)}
          className="min-h-64 px-4 py-3 text-sm leading-6 text-neutral-800 outline-none [&_a]:text-primary [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-1 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
        />
      </div>
    </div>
  );
}
