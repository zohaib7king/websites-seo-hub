import Layout from "../components/Layout.jsx";
import { getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "sunset", domain: site?.domain || SITE.domain } };
}

export default function Contact({ theme, domain }) {
  const email = `hello@${domain}`;

  return (
    <Layout title="Contact Us" description={`Contact ${SITE.name} for support with photo remakes.`} theme={theme} canonical={`https://${SITE.domain}/contact`}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 className="hero-title" style={{ fontSize: 36, fontWeight: 950, marginBottom: 10 }}>Contact Us</h1>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
          Questions about uploads, privacy, or how the remake tool works? Send us a message.
        </p>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Email</div>
          <a href={`mailto:${email}`} style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{email}</a>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 16, lineHeight: 1.7 }}>
            We usually reply within 2–3 business days. Please do not email childhood photos — use the secure Photo Remake tool instead.
          </p>
        </div>
      </div>
    </Layout>
  );
}
