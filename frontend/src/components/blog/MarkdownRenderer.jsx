import React from "react";

// Inline parser for bold, italic, inline code, and links
export function renderInline(text) {
  if (!text) return "";

  // Tokenize regex for [link](url), **bold**, *italic*, `code`, ~~strike~~
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*|`[^`]+`|~~[^~]+~~)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#818cf8",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            wordBreak: "break-all",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {linkMatch[1]}
        </a>
      );
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} style={{ color: "#fff", fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: _text_ or *text*
    if (
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2) ||
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2)
    ) {
      return (
        <em key={i} style={{ fontStyle: "italic", color: "rgba(255,255,255,0.85)" }}>
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline code: `text`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "#38bdf8",
            padding: "2px 6px",
            borderRadius: "5px",
            fontFamily: "monospace",
            fontSize: "0.9em",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Strikethrough: ~~text~~
    if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      return (
        <del key={i} style={{ opacity: 0.6 }}>
          {part.slice(2, -2)}
        </del>
      );
    }

    return part;
  });
}

export default function MarkdownRenderer({ content, className = "" }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block: ```
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div
          key={`code-${i}`}
          style={{
            margin: "20px 0",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#080808",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {lang && (
            <div
              style={{
                padding: "6px 14px",
                fontSize: "11px",
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {lang}
            </div>
          )}
          <pre
            style={{
              padding: "16px",
              margin: 0,
              overflowX: "auto",
              fontFamily: "Consolas, Monaco, 'Courier New', monospace",
              fontSize: "13px",
              lineHeight: 1.6,
              color: "#e2e8f0",
            }}
          >
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Blockquote: >
    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          style={{
            margin: "20px 0",
            padding: "12px 18px",
            borderLeft: "3px solid #6366f1",
            background: "rgba(99,102,241,0.05)",
            borderRadius: "0 10px 10px 0",
            color: "rgba(255,255,255,0.75)",
            fontStyle: "italic",
            lineHeight: 1.7,
          }}
        >
          {quoteLines.map((ql, qi) => (
            <p key={qi} style={{ margin: qi === 0 ? 0 : "8px 0 0" }}>
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // H1: #
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${i}`}
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 400,
            color: "#fff",
            margin: "36px 0 16px",
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
          }}
        >
          {line.replace("# ", "")}
        </h1>
      );
    }
    // H2: ##
    else if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(20px, 3vw, 24px)",
            fontWeight: 400,
            color: "#fff",
            margin: "30px 0 14px",
            paddingBottom: "8px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          }}
        >
          {line.replace("## ", "")}
        </h2>
      );
    }
    // H3: ###
    else if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          style={{
            fontSize: "17px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
            margin: "24px 0 10px",
            letterSpacing: "-0.01em",
          }}
        >
          {line.replace("### ", "")}
        </h3>
      );
    }
    // Unordered List: - or *
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        listItems.push(
          <li
            key={`li-${i}`}
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "15px",
              lineHeight: 1.8,
              marginBottom: "6px",
            }}
          >
            {renderInline(lines[i].replace(/^[-*] /, ""))}
          </li>
        );
        i++;
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          style={{
            paddingLeft: "22px",
            margin: "14px 0",
            listStyleType: "disc",
          }}
        >
          {listItems}
        </ul>
      );
      continue;
    }
    // Ordered List: 1.
    else if (/^\d+\. /.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push(
          <li
            key={`oli-${i}`}
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "15px",
              lineHeight: 1.8,
              marginBottom: "6px",
            }}
          >
            {renderInline(lines[i].replace(/^\d+\. /, ""))}
          </li>
        );
        i++;
      }
      elements.push(
        <ol
          key={`ol-${i}`}
          style={{
            paddingLeft: "24px",
            margin: "14px 0",
            listStyleType: "decimal",
          }}
        >
          {listItems}
        </ol>
      );
      continue;
    }
    // Horizontal Rule: --- or ***
    else if (line.trim() === "---" || line.trim() === "***") {
      elements.push(
        <hr
          key={`hr-${i}`}
          style={{
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            margin: "32px 0",
          }}
        />
      );
    }
    // Empty line: spacer
    else if (line.trim() === "") {
      // ignored
    }
    // Normal paragraph
    else {
      elements.push(
        <p
          key={`p-${i}`}
          style={{
            color: "rgba(255,255,255,0.68)",
            fontSize: "15.5px",
            lineHeight: 1.85,
            margin: "0 0 16px",
          }}
        >
          {renderInline(line)}
        </p>
      );
    }

    i++;
  }

  return <div className={`markdown-body ${className}`}>{elements}</div>;
}
