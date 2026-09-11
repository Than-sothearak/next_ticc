import { useState, useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import HardBreak from "@tiptap/extension-hard-break";
import { Button } from "@/components/ui/button";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Undo2,
  Quote,
} from "lucide-react";

const ToolbarButton = ({ label, active, children, onClick, disabled }) => (
  <Button
    type="button"
    size="icon"
    variant={active ? "default" : "ghost"}
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className="h-8 w-8"
  >
    {children}
  </Button>
);

export default function TextEditor({ value, onChange, editable = true }) {
  const [initialized, setInitialized] = useState(false); // track initial content load

  const extensions = useMemo(() => [
    StarterKit.configure({
      paragraph: { HTMLAttributes: { class: "my-3 leading-7" } },
    }),
    HardBreak,
    Image,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class:
          "text-primary no-underline transition-colors hover:text-primary/80",
      },
    }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
  ], []);

  const editor = useEditor({
    extensions,
    editable,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {},
    immediatelyRender: false,
  });

  // ✅ Only set initial content once
  useEffect(() => {
    if (editor && !initialized) {
      editor.commands.setContent(value || "<p></p>");
      setInitialized(true);
    }
  }, [editor, value, initialized]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      {editable && (
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
          <div className="flex items-center gap-1 pr-2 sm:border-r">
            <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
              <Undo2 />
            </ToolbarButton>
            <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
              <Redo2 />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-1 pr-2 sm:border-r">
            <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold />
            </ToolbarButton>
            <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic />
            </ToolbarButton>
            <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
              <Strikethrough />
            </ToolbarButton>
            <ToolbarButton label="Clear formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
              <RemoveFormatting />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-1 pr-2 sm:border-r">
            <ToolbarButton label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 />
            </ToolbarButton>
            <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 />
            </ToolbarButton>
            <ToolbarButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-1 pr-2 sm:border-r">
            <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <List />
            </ToolbarButton>
            <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered />
            </ToolbarButton>
            <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-1 pr-2 sm:border-r">
            <ToolbarButton label="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
              <AlignLeft />
            </ToolbarButton>
            <ToolbarButton label="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
              <AlignCenter />
            </ToolbarButton>
            <ToolbarButton label="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
              <AlignRight />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-1">
            <ToolbarButton
              label="Add link"
              active={editor.isActive("link")}
              onClick={() => {
                const url = prompt("Enter URL");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
            >
              <LinkIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Add image"
              onClick={() => {
                const url = prompt("Enter image URL");
                if (url) editor.chain().focus().setImage({ src: url }).run();
              }}
            >
              <ImageIcon />
            </ToolbarButton>
          </div>
        </div>
      )}

      {/* Editor Area */}
      <EditorContent
        editor={editor}
        className="min-h-[220px] p-4 focus:outline-none prose max-w-none [&_.ProseMirror]:min-h-[188px] [&_.ProseMirror]:outline-none [&_p]:my-3 [&_p]:leading-7 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mt-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground"
      />
    </div>
  );
}
