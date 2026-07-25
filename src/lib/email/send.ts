import "server-only";
import {
  getAdminNotifyEmail,
  getEmailFrom,
  getResend,
  isEmailConfigured,
} from "@/lib/email/client";
import {
  broadcastEmail,
  donationThankYouEmail,
  subscriberWelcomeEmail,
  volunteerAdminNoticeEmail,
  volunteerConfirmationEmail,
  volunteerReplyEmail,
} from "@/lib/email/templates";
import type { DonationInterval } from "@/types/donation";

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

async function sendOne(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email is not configured." };
  }

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    });

    if (error) {
      console.error("Resend send error", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (error) {
    console.error("Resend send exception", error);
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not send email.",
    };
  }
}

export async function sendVolunteerEmails(input: {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  interest: string;
  message?: string;
}): Promise<SendEmailResult> {
  const confirmation = volunteerConfirmationEmail({
    fullName: input.fullName,
    interest: input.interest,
  });

  const toVolunteer = await sendOne({
    to: input.email,
    subject: confirmation.subject,
    html: confirmation.html,
    replyTo: getAdminNotifyEmail() || undefined,
  });

  const adminTo = getAdminNotifyEmail();
  if (adminTo) {
    const notice = volunteerAdminNoticeEmail({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      province: input.province,
      interest: input.interest,
      message: input.message ?? "",
    });

    await sendOne({
      to: adminTo,
      subject: notice.subject,
      html: notice.html,
      replyTo: input.email,
    });
  }

  return toVolunteer;
}

export async function sendSubscriberWelcome(
  email: string,
): Promise<SendEmailResult> {
  const welcome = subscriberWelcomeEmail();
  return sendOne({
    to: email,
    subject: welcome.subject,
    html: welcome.html,
    replyTo: getAdminNotifyEmail() || undefined,
  });
}

export async function sendDonationThankYou(input: {
  email: string;
  donorName?: string;
  amount: number;
  currency: string;
  interval: DonationInterval;
}): Promise<SendEmailResult> {
  if (!input.email) {
    return { ok: false, error: "No donor email." };
  }

  const thankYou = donationThankYouEmail(input);
  return sendOne({
    to: input.email,
    subject: thankYou.subject,
    html: thankYou.html,
    replyTo: getAdminNotifyEmail() || undefined,
  });
}

export async function sendBroadcast(input: {
  subject: string;
  body: string;
  recipients: string[];
}): Promise<{ sent: number; failed: number; error?: string }> {
  if (!isEmailConfigured()) {
    return { sent: 0, failed: 0, error: "Email is not configured." };
  }

  const recipients = Array.from(
    new Set(
      input.recipients
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  );

  if (recipients.length === 0) {
    return { sent: 0, failed: 0, error: "No recipients." };
  }

  const content = broadcastEmail({
    subject: input.subject,
    body: input.body,
  });

  const resend = getResend();
  const from = getEmailFrom();
  const replyTo = getAdminNotifyEmail() || undefined;
  let sent = 0;
  let failed = 0;

  // Resend batch accepts up to 100 emails per request.
  const chunkSize = 100;

  for (let index = 0; index < recipients.length; index += chunkSize) {
    const chunk = recipients.slice(index, index + chunkSize);

    try {
      const { data, error } = await resend.batch.send(
        chunk.map((to) => ({
          from,
          to,
          subject: content.subject,
          html: content.html,
          ...(replyTo ? { replyTo } : {}),
        })),
      );

      if (error) {
        console.error("Resend batch error", error);
        failed += chunk.length;
        continue;
      }

      const results = data?.data ?? [];
      sent += results.length;
      failed += Math.max(0, chunk.length - results.length);
    } catch (error) {
      console.error("Resend batch exception", error);
      failed += chunk.length;
    }
  }

  return { sent, failed };
}

export async function sendVolunteerReply(input: {
  to: string;
  recipientName: string;
  subject: string;
  body: string;
  originalMessage?: string;
  replyTo?: string | null;
}): Promise<SendEmailResult> {
  const content = volunteerReplyEmail({
    recipientName: input.recipientName,
    subject: input.subject,
    body: input.body,
    originalMessage: input.originalMessage,
  });

  return sendOne({
    to: input.to,
    subject: content.subject,
    html: content.html,
    replyTo: input.replyTo || getAdminNotifyEmail() || undefined,
  });
}
