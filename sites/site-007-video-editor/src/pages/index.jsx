import Link from "next/link";
import Layout from "../components/Layout.jsx";
import ScrollReveal from "../components/ScrollReveal.jsx";
import ThumbnailReel, { ThumbnailGrid } from "../components/ThumbnailReel.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import { getEditorBundle, getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const [site, bundle] = await Promise.all([getSite(), getEditorBundle()]);
  return {
    props: {
      theme: site?.theme || SITE.defaultTheme,
      brand: bundle.brand,
      portfolio: bundle.portfolio,
      services: bundle.services,
      testimonials: bundle.testimonials,
      thumbnails: bundle.thumbnails,
      team: bundle.team,
    },
  };
}

function TeamSection({ team }) {
  if (!team.length) return null;
  return (
    <section className="pro-section" style={{ maxWidth: "var(--max)", margin: "0 auto" }}>
      <ScrollReveal>
        <p className="pro-eyebrow" style={{ marginBottom: 10 }}>Our team</p>
        <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, marginBottom: 36, lineHeight: 1.15 }}>
          People behind the edits
        </h2>
      </ScrollReveal>
      <div className="sw-team-grid">
        {team.map((member, i) => (
          <ScrollReveal key={member.id} delay={i * 70}>
            <article className="sw-team-card">
              <div className="sw-team-photo">
                {member.photo_url ? <img src={member.photo_url} alt={member.name} /> : null}
              </div>
              <h3 className="sw-team-name">{member.name}</h3>
              {member.role && <div className="sw-team-role">{member.role}</div>}
              {member.bio && <p className="sw-team-bio">{member.bio}</p>}
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export default function Home({ theme, brand, portfolio, services, testimonials, thumbnails, team }) {
  const featured = portfolio.filter((p) => p.featured).slice(0, 3);
  const showProjects = featured.length ? featured : portfolio.slice(0, 3);

  return (
    <Layout title="Video Editor" description={brand.tagline} theme={theme} brand={brand} canonical={`https://${brand.domain}`} fullWidth>
      <section className="pro-section" style={{ maxWidth: "var(--max)", margin: "0 auto", paddingTop: 56 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 40, alignItems: "center" }} className="hero-grid">
          <ScrollReveal>
            <p className="pro-eyebrow" style={{ marginBottom: 14 }}>{brand.eyebrow}</p>
            <h1 style={{ fontSize: "clamp(36px,5vw,52px)", fontWeight: 800, lineHeight: 1.12, marginBottom: 18 }}>
              {brand.lead}{" "}
              <span className="pro-accent">{brand.accent}</span>
            </h1>
            <p style={{ fontSize: 18, color: "var(--muted)", lineHeight: 1.7, maxWidth: 520, marginBottom: 24 }}>
              {brand.tagline}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/contact" className="sw-btn sw-btn-primary">{brand.heroCta || "Get in touch"}</Link>
              <Link href="/portfolio" className="sw-btn sw-btn-ghost">View my work</Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <div style={{
              borderRadius: "var(--radius)", overflow: "hidden",
              border: "1px solid var(--border)", boxShadow: "var(--shadow)",
              aspectRatio: "16/10", background: "var(--surface)",
            }}>
              {(thumbnails[0]?.thumbnail_url || showProjects[0]?.thumbnail_url) ? (
                <img
                  src={thumbnails[0]?.thumbnail_url || showProjects[0]?.thumbnail_url}
                  alt="Featured"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "var(--hero)", opacity: 0.15 }} />
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {thumbnails.length > 0 && (
        <ScrollReveal>
          <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "0 24px" }}>
            <p className="pro-eyebrow" style={{ marginBottom: 8 }}>Gallery</p>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Thumbnail showcase</h2>
          </div>
          <ThumbnailReel items={thumbnails} />
        </ScrollReveal>
      )}

      {showProjects.length > 0 && (
        <section className="pro-section pro-band" style={{ maxWidth: "var(--max)", margin: "0 auto" }}>
          <ScrollReveal>
            <p className="pro-eyebrow" style={{ marginBottom: 10 }}>Portfolio</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, marginBottom: 28 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800 }}>My work</h2>
              <Link href="/portfolio" className="sw-btn sw-btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>See all →</Link>
            </div>
          </ScrollReveal>
          <div className="port-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {showProjects.map((item) => (
              <ScrollReveal key={item.id} delay={item.id % 3 * 60}>
                <ProjectCard item={item} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {thumbnails.length > 0 && (
        <section className="pro-section" style={{ maxWidth: "var(--max)", margin: "0 auto" }}>
          <ScrollReveal>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 28 }}>Featured thumbnails</h2>
            <ThumbnailGrid items={thumbnails.slice(0, 6)} />
          </ScrollReveal>
        </section>
      )}

      {services.length > 0 && (
        <section className="pro-section" style={{ maxWidth: "var(--max)", margin: "0 auto" }}>
          <ScrollReveal>
            <p className="pro-eyebrow" style={{ marginBottom: 10 }}>Services</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>What we offer</h2>
          </ScrollReveal>
          <div className="svc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {services.slice(0, 3).map((svc, i) => (
              <ScrollReveal key={svc.id} delay={i * 70}>
                <div className="card-hover" style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius)", padding: 24, boxShadow: "var(--shadow)",
                  borderTop: `3px solid ${i % 2 === 0 ? "var(--accent)" : "var(--accent2)"}`,
                }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{svc.title}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65, marginBottom: 12 }}>{svc.description}</p>
                  {svc.price_label && <div style={{ fontWeight: 800, color: "var(--accent)" }}>{svc.price_label}</div>}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      <TeamSection team={team} />

      {testimonials.length > 0 && (
        <section className="pro-section pro-band" style={{ maxWidth: "var(--max)", margin: "0 auto" }}>
          <ScrollReveal>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 28 }}>Client reviews</h2>
          </ScrollReveal>
          <div className="feature-split" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {testimonials.slice(0, 3).map((t, i) => (
              <ScrollReveal key={t.id} delay={i * 60}>
                <blockquote style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius)", padding: 22, boxShadow: "var(--shadow)",
                }}>
                  <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>&ldquo;{t.quote}&rdquo;</p>
                  <footer><strong>{t.client_name}</strong></footer>
                </blockquote>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      <section style={{ padding: "64px 24px", textAlign: "center", background: "var(--hero)", color: "#fff" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ opacity: 0.9, maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Share your footage and deadline — we will reply with a clear plan and quote.
          </p>
          <Link href="/contact" className="sw-btn" style={{ background: "#fff", color: "var(--accent)", borderColor: "#fff" }}>
            Contact us
          </Link>
        </ScrollReveal>
      </section>
    </Layout>
  );
}
