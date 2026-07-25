import { siteConfig } from "@/lib/data";

const PRIMARY = "#0F3D91";
const MUTED = "#5B6475";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function emailLayout(options: {
  title: string;
  preview?: string;
  bodyHtml: string;
}): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || siteConfig.url;
  const logoUrl = `${siteUrl}/images/logo.jpeg`;
  const preview = options.preview
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(options.preview)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:Georgia,'Times New Roman',serif;">
  ${preview}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8ecf2;">
          <tr>
            <td style="background:${PRIMARY};padding:28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:16px;vertical-align:middle;">
                    <img
                      src="${escapeHtml(logoUrl)}"
                      width="72"
                      alt="${escapeHtml(siteConfig.shortName)}"
                      style="display:block;width:72px;height:auto;border:0;border-radius:6px;background:#ffffff;"
                    />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.75);">
                      ${escapeHtml(siteConfig.translation)}
                    </p>
                    <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#ffffff;">
                      ${escapeHtml(siteConfig.shortName)}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#1a1f2c;font-size:16px;line-height:1.6;">
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${MUTED};">
              <p style="margin:0;">
                ${escapeHtml(siteConfig.name)} ·
                <a href="${escapeHtml(siteUrl)}" style="color:${PRIMARY};text-decoration:none;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a>
              </p>
              <p style="margin:8px 0 0;">
                Questions? Write to
                <a href="mailto:${escapeHtml(siteConfig.email)}" style="color:${PRIMARY};text-decoration:none;">${escapeHtml(siteConfig.email)}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(text)}</p>`;
}

export function button(href: string, label: string): string {
  return `<p style="margin:24px 0;">
    <a href="${escapeHtml(href)}" style="display:inline-block;background:${PRIMARY};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px;">
      ${escapeHtml(label)}
    </a>
  </p>`;
}
