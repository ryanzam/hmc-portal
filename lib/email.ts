import nodemailer from "nodemailer";

const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const APP_NAME = "HMC. Portal";
const FROM = `"${APP_NAME}" <${process.env.EMAIL_FROM ?? process.env.EMAIL_USER ?? "noreply@hmcportal.com"}>`;

/* function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT ?? 587),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
} */

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'tyrese.batz@ethereal.email',
      pass: 'VwS6A7CdBJ4ApXUkUT'
    }
  });
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({ from: FROM, to, subject, html });
}

/** Shared HTML wrapper for all emails */
function emailLayout(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:ui-sans-serif,system-ui,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden;max-width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:24px 32px;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">${APP_NAME}</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f1f5f9;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                This is an automated message from ${APP_NAME}. Please do not reply to this email.
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

function h1(text: string) {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">${text}</h1>`;
}

function p(text: string, style = "") {
  return `<p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;${style}">${text}</p>`;
}

function badge(text: string, color: string) {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:9999px;font-size:13px;font-weight:600;background:${color};color:#fff;text-transform:capitalize;">${text}</span>`;
}

function ctaButton(label: string, href: string) {
  return `
  <p style="margin:24px 0 0;">
    <a href="${href}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:6px;">
      ${label}
    </a>
  </p>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`;
}

function infoRow(label: string, value: string) {
  return `
  <tr>
    <td style="padding:8px 0;font-size:14px;color:#64748b;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:500;">${value}</td>
  </tr>`;
}

// ─────────────────────────────────────────────
// 1. Email Verification
// ─────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  name: string,
  code: string
): Promise<void> {
  const subject = `${APP_NAME} — Verify your email address`;
  const body = `
    ${h1("Verify your email address")}
    ${p(`Hi <strong>${name}</strong>, thanks for registering with ${APP_NAME}.`)}
    ${p("Please enter the 6-digit code below to activate your account. This code expires in <strong>15 minutes</strong>.")}
    <div style="margin:24px 0;text-align:center;">
      <span style="display:inline-block;font-size:36px;font-weight:800;letter-spacing:12px;color:#0f172a;background:#f1f5f9;padding:16px 28px;border-radius:8px;border:1px solid #e2e8f0;">
        ${code}
      </span>
    </div>
    ${p("If you did not create an account, you can safely ignore this email.", "color:#94a3b8;font-size:13px;")}
  `;
  await sendMail(to, subject, emailLayout(subject, body));
}

// ─────────────────────────────────────────────
// 2. Admin — new application submitted
// ─────────────────────────────────────────────

export interface AdminApplicationNotificationData {
  applicantName: string;
  applicantEmail: string;
  serviceType: string;
  applicationId: string;
  action: "submitted" | "updated";
}

export async function sendAdminApplicationNotification(
  data: AdminApplicationNotificationData
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("[Email] ADMIN_EMAIL not set — skipping admin notification.");
    return;
  }

  const verb = data.action === "submitted" ? "submitted" : "updated";
  const subject = `${APP_NAME} — Application ${verb}: ${data.serviceType} (${data.applicantName})`;
  const reviewUrl = `${APP_URL}/admin/applications/${data.applicationId}`;

  const body = `
    ${h1(`Application ${verb}`)}
    ${p(`An application has been <strong>${verb}</strong> and is awaiting your review.`)}
    ${divider()}
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      ${infoRow("Applicant", data.applicantName)}
      ${infoRow("Email", data.applicantEmail)}
      ${infoRow("Service", data.serviceType)}
      ${infoRow("Action", verb.charAt(0).toUpperCase() + verb.slice(1))}
    </table>
    ${ctaButton("Review Application →", reviewUrl)}
  `;
  await sendMail(adminEmail, subject, emailLayout(subject, body));
}

// ─────────────────────────────────────────────
// 3. User — application status changed
// ─────────────────────────────────────────────

export interface UserStatusNotificationData {
  to: string;
  name: string;
  serviceType: string;
  status: string;
  adminRemark: string;
  applicationId: string;
}

const STATUS_COLOR: Record<string, string> = {
  "pending": "#16a34a",
  "incomplete submission": "#dc2626",
  "completed": "#d97706",
};

export async function sendUserStatusNotification(
  data: UserStatusNotificationData
): Promise<void> {
  const color = STATUS_COLOR[data.status] ?? "#64748b";
  const subject = `${APP_NAME} — Your ${data.serviceType} application has been ${data.status}`;
  const appUrl = `${APP_URL}/dashboard/applications/${data.applicationId}`;

  const body = `
    ${h1("Application status updated")}
    ${p(`Hi <strong>${data.name}</strong>, your <strong>${data.serviceType}</strong> application status has been updated.`)}
    ${divider()}
    <p style="margin:0 0 8px;font-size:14px;color:#64748b;">New status</p>
    ${badge(data.status, color)}
    ${data.adminRemark
      ? `${divider()}
           <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Admin remark</p>
           <p style="margin:0;font-size:15px;color:#0f172a;background:#f1f5f9;padding:12px 16px;border-radius:6px;border-left:4px solid ${color};">${data.adminRemark}</p>`
      : ""
    }
    ${ctaButton("View Application →", appUrl)}
  `;
  await sendMail(data.to, subject, emailLayout(subject, body));
}
