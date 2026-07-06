import Link from "next/link";
import Layout from "../components/Layout.jsx";
import ScrollReveal from "../components/ScrollReveal.jsx";
import { getEditorBundle, getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const [site, bundle] = await Promise.all([getSite(), getEditorBundle()]);
  return {
    props: {
      theme: site?.theme || SITE.defaultTheme,
      brand: bundle.brand,
      team: bundle.team,
    },
  };
}

export default function About({ theme, brand, team }) {
  return (
    <Layout
      title="About"
      description={brand.aboutBody}
      theme={theme}
      brand={brand}
      canonical={`https://${brand.domain}/about`}
    >
      <section style={{ paddingTop: 48, paddingBottom: 48 }}>
        <ScrollReveal>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
            About
          </p>
          <h1 className="sw-headline" style={{ fontSize: "clamp(40px,6vw,64px)", marginBottom: 20 }}>
            {brand.aboutTitle || `About ${brand.name}`}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 18, lineHeight: 1.85, maxWidth: 720, whiteSpace: "pre-wrap" }}>
            {brand.aboutBody}
          </p>
        </ScrollReveal>
      </section>

      {team.length > 0 && (
        <section style={{ paddingBottom: 56 }}>
          <ScrollReveal>
            <h2 className="sw-headline" style={{ fontSize: "clamp(32px,4vw,48px)", marginBottom: 36 }}>
              Meet the team
            </h2>
          </ScrollReveal>
          <div className="sw-team-grid">
            {team.map((member, i) => (
              <ScrollReveal key={member.id} delay={i * 80}>
                <article className="sw-team-card">
                  <div className="sw-team-photo">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "var(--border)" }} />
                    )}
                  </div>
                  <h3 className="sw-team-name">{member.name}</h3>
                  {member.role && <div className="sw-team-role">{member.role}</div>}
                  {member.bio && <p className="sw-team-bio">{member.bio}</p>}
                  {member.social_url && (
                    <a href={member.social_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 700, marginTop: 10, display: "inline-block" }}>
                      Follow →
                    </a>
                  )}
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      <ScrollReveal>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 32 }}>
          <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>{brand.location}</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{brand.email}</div>
          {brand.phone && <div style={{ color: "var(--muted)", marginBottom: 20 }}>{brand.phone}</div>}
          <Link href="/contact" className="sw-btn sw-btn-primary">{brand.heroCta || "Get in touch"}</Link>
        </div>
      </ScrollReveal>
    </Layout>
  );
}
