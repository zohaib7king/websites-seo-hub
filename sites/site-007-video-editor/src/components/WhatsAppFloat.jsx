import { whatsappLink } from "../lib/whatsapp";

export default function WhatsAppFloat({ url, message }) {
  const href = whatsappLink(url, message);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="wa-float"
      style={{
        position: "fixed", right: 22, bottom: 22, zIndex: 60,
        display: "inline-flex", alignItems: "center", gap: 10,
        background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 14,
        padding: "12px 18px", borderRadius: 999,
        boxShadow: "0 8px 28px rgba(37,211,102,.45)",
        transition: "transform .2s, box-shadow .2s",
      }}
    >
      <span style={{ fontSize: 20, lineHeight: 1 }}>💬</span>
      WhatsApp
    </a>
  );
}
