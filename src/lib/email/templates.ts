import { siteConfig } from "@/lib/data";
import { button, emailLayout, escapeHtml, paragraph } from "@/lib/email/layout";
import {
  describeInterval,
  formatDonationAmount,
  type DonationInterval,
} from "@/types/donation";

export function volunteerConfirmationEmail(input: {
  fullName: string;
  interest: string;
}): { subject: string; html: string } {
  const subject = `Thank you for registering — ${siteConfig.shortName}`;
  const html = emailLayout({
    title: subject,
    preview: "We received your institutional registration.",
    bodyHtml: [
      paragraph(`Dear ${input.fullName},`),
      paragraph(
        `Thank you for registering your interest with ${siteConfig.name}. We have received your submission for ${input.interest}.`,
      ),
      paragraph(
        "Our team will review your registration and follow up with next steps. Together we continue the peaceful, lawful work of restoring the Constitution.",
      ),
    ].join(""),
  });

  return { subject, html };
}

export function volunteerAdminNoticeEmail(input: {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  interest: string;
  message: string;
}): { subject: string; html: string } {
  const subject = `New registration: ${input.fullName}`;
  const rows = [
    ["Name", input.fullName],
    ["Email", input.email],
    ["Phone", input.phone],
    ["Province", input.province],
    ["Interest", input.interest],
  ]
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5B6475;width:120px;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1f2c;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  const messageBlock = input.message
    ? `<p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5B6475;">Message</p>
       <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1a1f2c;white-space:pre-wrap;">${escapeHtml(input.message)}</p>`
    : "";

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url
  ).replace(/\/$/, "");

  const html = emailLayout({
    title: subject,
    preview: `${input.fullName} registered interest (${input.interest}).`,
    bodyHtml: `
      ${paragraph("A new institutional registration was submitted on the website.")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">${rows}</table>
      ${messageBlock}
      ${button(`${siteUrl}/admin/volunteers`, "Open volunteers")}
    `,
  });

  return { subject, html };
}

export function subscriberWelcomeEmail(): { subject: string; html: string } {
  const subject = `Welcome to ${siteConfig.shortName}`;
  const html = emailLayout({
    title: subject,
    preview: "You're subscribed to Coalition updates.",
    bodyHtml: [
      paragraph("Thank you for subscribing."),
      paragraph(
        `You will receive updates from ${siteConfig.name} on our work to restore the Constitution through peaceful, lawful civic action.`,
      ),
    ].join(""),
  });

  return { subject, html };
}

export function donationThankYouEmail(input: {
  donorName?: string;
  amount: number;
  currency: string;
  interval: DonationInterval;
}): { subject: string; html: string } {
  const amountLabel = formatDonationAmount(input.amount, input.currency);
  const intervalLabel = describeInterval(input.interval);
  const subject = `Thank you for your ${amountLabel} gift`;
  const greeting = input.donorName?.trim()
    ? `Dear ${input.donorName.trim()},`
    : "Dear friend,";
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url
  ).replace(/\/$/, "");

  const html = emailLayout({
    title: subject,
    preview: `Your ${intervalLabel.toLowerCase()} gift of ${amountLabel} was received.`,
    bodyHtml: [
      paragraph(greeting),
      paragraph(
        `Thank you for your ${intervalLabel.toLowerCase()} gift of ${amountLabel} to ${siteConfig.name}. Your support funds civic education, community dialogues, and peaceful constitutional work.`,
      ),
      paragraph(
        "A payment receipt from Stripe has also been sent separately. You can track donations in the partner portal when signed in with the same email.",
      ),
      button(`${siteUrl}/partner`, "Open partner portal"),
    ].join(""),
  });

  return { subject, html };
}

export function broadcastEmail(input: {
  subject: string;
  body: string;
}): { subject: string; html: string } {
  const bodyHtml = input.body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;">${block
          .split("\n")
          .map((line) => escapeHtml(line))
          .join("<br />")}</p>`,
    )
    .join("");

  const html = emailLayout({
    title: input.subject,
    preview: input.body.replace(/\s+/g, " ").slice(0, 120),
    bodyHtml,
  });

  return { subject: input.subject.trim(), html };
}

export function volunteerReplyEmail(input: {
  recipientName: string;
  subject: string;
  body: string;
  originalMessage?: string;
}): { subject: string; html: string } {
  const greeting = input.recipientName.trim()
    ? `Dear ${input.recipientName.trim()},`
    : "Dear friend,";

  const bodyHtml = input.body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;">${block
          .split("\n")
          .map((line) => escapeHtml(line))
          .join("<br />")}</p>`,
    )
    .join("");

  const original = input.originalMessage?.trim()
    ? `<div style="margin-top:28px;padding-top:20px;border-top:1px solid #e8ecf2;">
        <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#5B6475;">Your message</p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#5B6475;white-space:pre-wrap;">${escapeHtml(input.originalMessage.trim())}</p>
      </div>`
    : "";

  const html = emailLayout({
    title: input.subject,
    preview: input.body.replace(/\s+/g, " ").slice(0, 120),
    bodyHtml: `${paragraph(greeting)}${bodyHtml}${original}`,
  });

  return { subject: input.subject.trim(), html };
}
