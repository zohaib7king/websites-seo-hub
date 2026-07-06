const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) {
    transporter = null;
    return null;
  }
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

async function sendInquiryEmail({ to, siteName, inquiry }) {
  const transport = getTransporter();
  const recipient = to || process.env.INQUIRY_NOTIFY_EMAIL;
  if (!transport || !recipient) {
    console.warn("[mailer] SMTP not configured — inquiry saved to admin only");
    return { sent: false };
  }

  const subject = `New inquiry — ${inquiry.name} (${siteName || "Video Editor"})`;
  const text = [
    `New contact inquiry on ${siteName || "your site"}`,
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : null,
    inquiry.project_type ? `Project: ${inquiry.project_type}` : null,
    "",
    "Message:",
    inquiry.message,
  ].filter(Boolean).join("\n");

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || recipient,
    to: recipient,
    replyTo: inquiry.email,
    subject,
    text,
    html: `<p><strong>New inquiry</strong> on ${siteName || "your site"}</p>
      <p><strong>Name:</strong> ${inquiry.name}<br/>
      <strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a><br/>
      ${inquiry.phone ? `<strong>Phone:</strong> ${inquiry.phone}<br/>` : ""}
      ${inquiry.project_type ? `<strong>Project:</strong> ${inquiry.project_type}<br/>` : ""}</p>
      <p><strong>Message:</strong></p><p>${String(inquiry.message).replace(/\n/g, "<br/>")}</p>`,
  });
  return { sent: true };
}

module.exports = { sendInquiryEmail };
