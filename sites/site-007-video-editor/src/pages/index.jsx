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
    <section style={{ padding: "80px 24px", maxWidth: "var(--max)", margin: "0 auto" }}>
      <ScrollReveal>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
          The team
        </p>
        <h2 className="sw-headline" style={{ fontSize: "clamp(36px,5vw,56px)", marginBottom: 48 }}>
          People behind<br />the edits.
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
  );
}

export default function Home({ theme, brand, portfolio, services, testimonials, thumbnails, team }) {
  const featured = portfolio.filter((p) => p.featured).slice(0, 3);
  const showProjects = featured.length ? featured : portfolio.slice(0, 3);
  const reelItems = thumbnails.length ? thumbnails : showProjects.map((p) => ({
    id: p.id,
    title: p.title,
    thumbnail_url: p.thumbnail_url,
    video_url: p.video_url,
    category: p.category,
  }));

  return (
    <Layout
      title="Video Editor"
      description={brand.tagline}
      theme={theme}
      brand={brand}
      canonical={`https://${brand.domain}`}
      fullWidth
    >
      {/* Hero — sandwich.co style */}
      <section style={{ padding: "72px 24px 40px", maxWidth: "var(--max)", margin: "0 auto" }}>
        <ScrollReveal>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".06em", color: "var(--muted)", marginBottom: 20 }}>
            {brand.eyebrow}
          </p>
          <h1 className="sw-hero-title sw-headline" style={{ fontSize: "clamp(52px,8vw,96px)", maxWidth: 900 }}>
            Hello. We&apos;re {brand.name}.
          </h1>
          <p style={{ fontSize: "clamp(18px,2.5vw,24px)", color: "var(--muted)", maxWidth: 560, marginTop: 28, lineHeight: 1.6 }}>
            {brand.tagline}
          </p>
          <div className="sw-scroll-hint">Scroll down to see some ↓</div>
        </ScrollReveal>
      </section>

      {/* Thumbnail reel */}
      {reelItems.length > 0 && (
        <ScrollReveal>
          <ThumbnailReel items={reelItems} />
        </ScrollReveal>
      )}

      {/* This should be simple */}
      <section style={{ padding: "80px 24px", maxWidth: "var(--max)", margin: "0 auto" }}>
        <ScrollReveal>
          <h2 className="sw-headline" style={{ fontSize: "clamp(40px,6vw,72px)", marginBottom: 28 }}>
            This should<br />be simple.
          </h2>
          <p style={{ fontSize: 18, color: "var(--muted)", maxWidth: 620, lineHeight: 1.75, marginBottom: 28 }}>
            Your footage is complex, but we make the final cut feel effortless. We get to the heart of your story,
            then shape it with clean edits, color, and sound — from YouTube to Reels to brand films.
          </p>
          <Link href="/portfolio" className="sw-btn sw-btn-ghost">See our <strong>Work</strong></Link>
        </ScrollReveal>
      </section>

      {/* Thumbnail grid showcase */}
      {thumbnails.length > 0 && (
        <section style={{ padding: "0 24px 80px", maxWidth: "var(--max)", margin: "0 auto" }}>
          <ScrollReveal>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
              Featured work
            </p>
            <h2 className="sw-headline" style={{ fontSize: "clamp(32px,4vw,48px)", marginBottom: 32 }}>
              What&apos;s good?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <ThumbnailGrid items={thumbnails.slice(0, 6)} />
          </ScrollReveal>
        </section>
      )}

      {/* Portfolio highlights */}
      {showProjects.length > 0 && (
        <section style={{ padding: "0 24px 80px", maxWidth: "var(--max)", margin: "0 auto" }}>
          <ScrollReveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, marginBottom: 28 }}>
              <h2 className="sw-headline" style={{ fontSize: "clamp(32px,4vw,48px)" }}>Portfolio</h2>
              <Link href="/portfolio" className="sw-btn sw-btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>See all →</Link>
            </div>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="port-grid">
            {showProjects.map((item) => (
              <ScrollReveal key={item.id} delay={item.id % 3 * 60}>
                <ProjectCard item={item} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section style={{ padding: "80px 24px", background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: "var(--max)", margin: "0 auto" }}>
            <ScrollReveal>
              <h2 className="sw-headline" style={{ fontSize: "clamp(36px,5vw,56px)", marginBottom: 40 }}>
                We got packages<br />too.
              </h2>
            </ScrollReveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} className="svc-grid">
              {services.slice(0, 3).map((svc, i) => (
                <ScrollReveal key={svc.id} delay={i * 80}>
                  <div style={{ padding: "28px 0", borderTop: "2px solid var(--accent)" }}>
                    <h3 className="sw-serif" style={{ fontSize: 28, marginBottom: 12 }}>{svc.title}</h3>
                    <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>{svc.description}</p>
                    {svc.price_label && <div style={{ fontWeight: 800, fontSize: 15 }}>{svc.price_label}</div>}
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <Link href="/services" className="sw-btn sw-btn-ghost" style={{ marginTop: 32, display: "inline-flex" }}>All packages</Link>
          </div>
        </section>
      )}

      {/* Team */}
      <TeamSection team={team} />

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section style={{ padding: "80px 24px", maxWidth: "var(--max)", margin: "0 auto" }}>
          <ScrollReveal>
            <h2 className="sw-headline" style={{ fontSize: "clamp(32px,4vw,48px)", marginBottom: 36 }}>
              Clients say nice things.
            </h2>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} className="feature-split">
            {testimonials.slice(0, 3).map((t, i) => (
              <ScrollReveal key={t.id} delay={i * 70}>
                <blockquote style={{ borderLeft: "3px solid var(--accent2)", paddingLeft: 20 }}>
                  <p style={{ fontSize: 17, lineHeight: 1.75, marginBottom: 16, fontFamily: "var(--serif)" }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer>
                    <strong style={{ fontSize: 14 }}>{t.client_name}</strong>
                    {t.client_role && <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{t.client_role}</div>}
                  </footer>
                </blockquote>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: "80px 24px 100px", textAlign: "center", background: "var(--accent)", color: "var(--bg)" }}>
        <ScrollReveal>
          <h2 className="sw-headline" style={{ fontSize: "clamp(36px,5vw,64px)", marginBottom: 16, color: "var(--bg)" }}>
            Ready to get started?
          </h2>
          <p style={{ opacity: 0.85, maxWidth: 480, margin: "0 auto 28px", fontSize: 17, lineHeight: 1.6 }}>
            Share your footage and deadline — we&apos;ll reply with a clear plan and quote.
          </p>
          <Link href="/contact" className="sw-btn" style={{ background: "var(--bg)", color: "var(--accent)", borderColor: "var(--bg)" }}>
            Get in touch
          </Link>
        </ScrollReveal>
      </section>
    </Layout>
  );
}
