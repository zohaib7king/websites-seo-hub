import Layout from "../components/Layout.jsx";
import { getSite } from "../lib/data";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || "midnight", domain: site?.domain || "" } };
}

export default function Contact({ theme, domain }) {
  const email = domain ? `hello@${domain}` : "hello@example.com";
  return (
    <Layout title="Contact" theme={theme}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 className="hero-title" style={{ fontSize: 34, fontWeight: 800, marginBottom: 10 }}>Get in touch</h1>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
          Have a question, correction, or partnership idea? We'd love to hear from you.
        </p>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28 }}>
          <div style={{ fontSize: 13, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Email us</div>
          <a href={`mailto:${email}`} style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{email}</a>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 18, lineHeight: 1.7 }}>
            We typically respond within 2–3 business days. For advertising inquiries, please include
            "Ads" in your subject line.
          </p>
        </div>
      </div>
    </Layout>
  );
}
