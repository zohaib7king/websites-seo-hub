import Layout from "../components/Layout.jsx";
import Link from "next/link";
import { getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "royal" } };
}

export default function About({ theme }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE.name}`,
    description: SITE.tagline,
    url: `https://${SITE.domain}/about`,
  };

  return (
    <Layout title="About Us" description={`Learn about ${SITE.name}, our Gulf career guides, and CV maker.`} theme={theme} canonical={`https://${SITE.domain}/about`} schema={schema}>
      <section className="glass-panel" style={{ borderRadius: 28, padding: "42px 30px", marginBottom: 28 }}>
        <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>About Us</span>
        <h1 className="hero-title" style={{ fontSize: 44, lineHeight: 1.08, letterSpacing: "-0.05em", fontWeight: 950, margin: "10px 0 14px" }}>
          Practical Gulf job guidance for serious applicants.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.85, maxWidth: 780 }}>
          {SITE.name} helps job seekers prepare better CVs, understand safer application steps, and apply with more confidence across the UAE, Saudi Arabia, Oman, Qatar, Kuwait, and Bahrain.
        </p>
      </section>

      <div className="feature-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 30 }}>
        {[
          ["CV Maker", "Create a clean Gulf-ready CV, choose a template, and download or print it when your details are ready.", "/cv-maker"],
          ["Career Articles", "Read focused guides about portals, interviews, visas, recruitment agencies, salaries, and safer job offers.", "/articles"],
        ].map(([title, text, href]) => (
          <Link key={title} href={href} className="card-hover" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 22, padding: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 8 }}>{title}</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.75 }}>{text}</p>
          </Link>
        ))}
      </div>

      <section style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 22, padding: 26 }}>
        <h2 style={{ fontSize: 26, fontWeight: 950, marginBottom: 12 }}>What we focus on</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          {["Clear CV formatting", "Trusted application channels", "Interview preparation", "Visa and offer safety", "Recruiter communication", "Gulf country guides"].map(item => (
            <div key={item} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16, color: "var(--text)", fontWeight: 800 }}>
              {item}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
