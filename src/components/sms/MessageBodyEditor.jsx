import React, { useEffect, useRef } from "react";
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiItalic,
  FiLink,
  FiList,
  FiMinus,
  FiType,
} from "react-icons/fi";
import { FaListOl } from "react-icons/fa";
import {
  buildWhatsAppLineInsert,
  normalizeBodyForChannel,
  plainToHtml,
  whatsAppTextToPreviewHtml,
} from "./templateBodyUtils";

export { stripHtml, plainToHtml } from "./templateBodyUtils";

const EMAIL_TOOLS = [
  { cmd: "bold", title: "Bold", icon: FiBold },
  { cmd: "italic", title: "Italic", icon: FiItalic },
  { cmd: "insertUnorderedList", title: "Bullet list", icon: FiList },
  { cmd: "insertOrderedList", title: "Numbered list", icon: FaListOl },
  { cmd: "justifyLeft", title: "Align left", icon: FiAlignLeft },
  { cmd: "justifyCenter", title: "Align center", icon: FiAlignCenter },
  { cmd: "justifyRight", title: "Align right", icon: FiAlignRight },
];

const EmailRichEditor = ({ value, onChange, placeholder, variables }) => {
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
        {EMAIL_TOOLS.map(({ cmd, title, icon: Icon }) => (
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
      <div className="sms-editor-channel-hint">Email supports HTML formatting. Header and footer are added automatically.</div>
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

const PlainTemplateEditor = ({ value, onChange, placeholder, variables, channel, firmName = "" }) => {
  const textareaRef = useRef(null);
  const isWhatsApp = channel === "whatsapp";

  const wrapSelection = (before, after = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.slice(start, end);
    const next = text.slice(0, start) + before + selected + after + text.slice(end);
    onChange?.(next);
    const cursor = start + before.length + selected.length + after.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const insertAtCursor = (token) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const next = text.slice(0, start) + token + text.slice(end);
    onChange?.(next);
    const cursor = start + token.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const insertNewLine = () => insertAtCursor("\n");

  const insertHorizontalLine = () => {
    const el = textareaRef.current;
    if (!el) return;
    const { text, cursor } = buildWhatsAppLineInsert(el.value, el.selectionStart);
    onChange?.(text);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="sms-rich-wrap sms-plain-wrap">
      <div className="sms-editor-toolbar">
        {isWhatsApp ? (
          <>
            <button
              type="button"
              className="sms-editor-tool"
              title="Bold (*text*)"
              onMouseDown={(e) => {
                e.preventDefault();
                wrapSelection("*");
              }}
            >
              <FiBold size={14} />
            </button>
            <button
              type="button"
              className="sms-editor-tool"
              title="Italic (_text_)"
              onMouseDown={(e) => {
                e.preventDefault();
                wrapSelection("_");
              }}
            >
              <FiItalic size={14} />
            </button>
            <button
              type="button"
              className="sms-editor-tool"
              title="New line"
              onMouseDown={(e) => {
                e.preventDefault();
                insertNewLine();
              }}
            >
              <FiType size={14} />
            </button>
            <button
              type="button"
              className="sms-editor-tool sms-editor-tool-line"
              title="Horizontal line (full width separator)"
              onMouseDown={(e) => {
                e.preventDefault();
                insertHorizontalLine();
              }}
            >
              <FiMinus size={14} />
            </button>
          </>
        ) : (
          <span className="sms-editor-plain-label">Plain text only</span>
        )}
        <span className="sms-toolbar-divider" />
        {variables.map((v) => (
          <button
            key={v.key}
            type="button"
            className="sms-var-chip"
            onMouseDown={(e) => {
              e.preventDefault();
              insertAtCursor(v.key);
            }}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="sms-editor-channel-hint">
        {isWhatsApp
          ? "WhatsApp: *bold*, _italic_, and horizontal line (—). HTML is not allowed. Footer is added when sent."
          : "SMS is plain text only — no HTML or formatting. Keep under 160 characters when possible."}
      </div>
      <textarea
        ref={textareaRef}
        className={`form-control sms-plain-editor${isWhatsApp && value ? " sms-plain-editor--with-preview" : ""}`}
        rows={10}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          insertAtCursor(text);
        }}
      />
      {isWhatsApp && value ? (
        <div className="sms-wa-inline-preview" aria-hidden="true">
          <span className="sms-wa-inline-preview__label">Line preview</span>
          <div className="sms-wa-inline-preview__bubble">
            <WhatsAppInlinePreview body={value} firmName={firmName} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

/** Mini formatted preview under WhatsApp editor (lines + footer render full width). */
const WhatsAppInlinePreview = ({ body = "", firmName = "" }) => {
  const html = whatsAppTextToPreviewHtml(body, { includeFooter: true, firmName });
  return (
    <div
      className="sms-wa-inline-preview__content wa-preview-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const MessageBodyEditor = ({
  value = "",
  onChange,
  placeholder = "Write your message template...",
  variables = [],
  channel = "email",
  firmName = "",
}) => {
  useEffect(() => {
    const normalized = normalizeBodyForChannel(value, channel);
    if (normalized !== value) {
      onChange?.(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  if (channel === "email") {
    return (
      <EmailRichEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        variables={variables}
      />
    );
  }

  return (
    <PlainTemplateEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      variables={variables}
      channel={channel}
      firmName={firmName}
    />
  );
};

export default MessageBodyEditor;
