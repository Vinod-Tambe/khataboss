import React, { useEffect, useRef } from "react";
import {
  FiAlignCenter,
  FiAlignJustify,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiItalic,
  FiLink,
  FiList,
} from "react-icons/fi";
import { FaListOl } from "react-icons/fa";

export const stripHtml = (html = "") => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\u00a0/g, " ");
};

export const plainToHtml = (text = "") => {
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
};

const TOOLS = [
  { cmd: "bold", title: "Bold", icon: FiBold },
  { cmd: "italic", title: "Italic", icon: FiItalic },
  { cmd: "insertUnorderedList", title: "Bullet list", icon: FiList },
  { cmd: "insertOrderedList", title: "Numbered list", icon: FaListOl },
  { cmd: "justifyLeft", title: "Align left", icon: FiAlignLeft },
  { cmd: "justifyCenter", title: "Align center", icon: FiAlignCenter },
  { cmd: "justifyRight", title: "Align right", icon: FiAlignRight },
  { cmd: "justifyFull", title: "Justify", icon: FiAlignJustify },
];

const MessageBodyEditor = ({
  value = "",
  onChange,
  placeholder = "Write your message template...",
  variables = [],
}) => {
  const editorRef = useRef(null);
  const lastHtml = useRef(value);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const next = plainToHtml(value);
    if (next !== lastHtml.current) {
      el.innerHTML = next || "";
      lastHtml.current = next;
    }
  }, [value]);

  const emitChange = () => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML === "<br>" ? "" : el.innerHTML;
    lastHtml.current = html;
    onChange?.(html);
  };

  const runCommand = (cmd, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    emitChange();
  };

  const handleLink = () => {
    editorRef.current?.focus();
    const url = window.prompt("Enter link URL", "https://");
    if (!url) return;
    document.execCommand("createLink", false, url);
    emitChange();
  };

  const insertVariable = (token) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, token);
    emitChange();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    emitChange();
  };

  return (
    <div className="sms-rich-wrap">
      <div className="sms-editor-toolbar">
        {TOOLS.map(({ cmd, title, icon: Icon }) => (
          <button
            key={cmd}
            type="button"
            className="sms-editor-tool"
            title={title}
            onMouseDown={(e) => {
              e.preventDefault();
              runCommand(cmd);
            }}
          >
            <Icon size={14} />
          </button>
        ))}
        <button
          type="button"
          className="sms-editor-tool"
          title="Insert link"
          onMouseDown={(e) => {
            e.preventDefault();
            handleLink();
          }}
        >
          <FiLink size={14} />
        </button>
        <span className="sms-toolbar-divider" />
        {variables.map((v) => (
          <button
            key={v.key}
            type="button"
            className="sms-var-chip"
            onMouseDown={(e) => {
              e.preventDefault();
              insertVariable(v.key);
            }}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="sms-rich-editor form-control"
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={handlePaste}
      />
    </div>
  );
};

export default MessageBodyEditor;
