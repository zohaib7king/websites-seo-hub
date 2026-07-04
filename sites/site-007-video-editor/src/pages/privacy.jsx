import Layout from "../components/Layout.jsx";
import { getEditorBundle, getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const [site, bundle] = await Promise.all([getSite(), getEditorBundle()]);
  return {
    props: {
      theme: site?.theme || SITE.defaultTheme,
      brand: bundle.brand,
    },
  };
}

const SECTIONS = [
  ["Overview", "This Privacy Policy explains how this freelance video editor website handles information when you visit or send a hire inquiry."],
  ["Contact form", "When you submit the contact form, we store your name, email, phone (optional), project type, and message so we can reply about your project."],
  ["No public gallery of your footage", "Project inquiries are private. We do not publish your unreleased footage or personal messages on the website."],
  ["Analytics & cookies", "We may use basic analytics to understand page traffic. Third-party ad partners may use cookies if advertising is enabled."],
  ["Your choices", "You can email us to request deletion of an inquiry you submitted."],
  ["Contact", "Privacy questions? Use the Contact page or the email listed on the site."],
];

export default function Privacy({ theme, brand }) {
  return (
    <Layout title="Privacy Policy" theme={theme} brand={brand}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 className="hero-title" style={{ fontSize: 34, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        {SECTIONS.map(([h, body]) => (
          <section key={h} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{h}</h2>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.8 }}>{body}</p>
          </section>
        ))}
      </div>
    </Layout>
  );
}
