import "server-only";
import sanitizeHtml from "sanitize-html";
import { htmlToPlainText } from "@/lib/email/html-text";

const FONT = "font-family:Arial,Helvetica,sans-serif;";
const PARAGRAPH = `${FONT}margin:0 0 16px;font-size:16px;line-height:1.6;color:#1a1f2c;`;
const HEADING = `${FONT}margin:0 0 12px;font-size:20px;line-height:1.35;font-weight:700;color:#0F3D91;`;
const LIST = `${FONT}margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.6;color:#1a1f2c;`;
const ITEM = `${FONT}margin:0 0 6px;`;
const QUOTE = `${FONT}margin:0 0 16px;padding:0 0 0 14px;border-left:3px solid #C9A227;font-size:16px;line-height:1.6;color:#5B6475;`;
const LINK = "color:#0F3D91;text-decoration:underline;";

function styled(tagName: string, style: string) {
  return () => ({ tagName, attribs: { style } });
}

function plaintextToHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) =>
          line
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;"),
        )
        .join("<br />");
      return `<p style="${PARAGRAPH}">${lines}</p>`;
    })
    .join("");
}

export function prepareBroadcastBody(body: string): {
  html: string;
  preview: string;
} {
  const trimmed = body.trim();
  if (!trimmed) {
    return { html: "", preview: "" };
  }

  if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
    return {
      html: plaintextToHtml(trimmed),
      preview: trimmed.replace(/\s+/g, " ").slice(0, 120),
    };
  }

  const html = sanitizeHtml(trimmed, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "h1",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "div",
    ],
    allowedAttributes: {
      a: ["href", "style", "target", "rel"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      ul: ["style"],
      ol: ["style"],
      li: ["style"],
      blockquote: ["style"],
      div: ["style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      p: styled("p", PARAGRAPH),
      div: styled("p", PARAGRAPH),
      h1: styled("h2", HEADING),
      h2: styled("h2", HEADING),
      h3: styled("h2", HEADING),
      ul: styled("ul", LIST),
      ol: styled("ol", LIST),
      li: styled("li", ITEM),
      blockquote: styled("blockquote", QUOTE),
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          href: attribs.href || "#",
          style: LINK,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  });

  return {
    html,
    preview: htmlToPlainText(html).slice(0, 120),
  };
}
