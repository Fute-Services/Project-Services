import nodemailer from "nodemailer";
import type { Client, Platform, Project } from "@/lib/clients";

export async function sendDownloadEmail(
  client: Client,
  project: Project,
  platform: Platform
) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) {
    // Email not configured yet — skip silently, download itself is unaffected.
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_USER,
    to: NOTIFY_EMAIL,
    subject: `Download: ${client.name} — ${project.title} (${platform})`,
    text: `${client.name} downloaded "${project.title}" (v${project.version}) for ${platform}.\n\nTotal downloads (${platform}): ${project.downloadCounts[platform]}`,
  });
}
