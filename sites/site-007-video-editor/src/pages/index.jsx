import Link from "next/link";
import Layout from "../components/Layout.jsx";
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
    },
  };
}

const PILL_COLORS = [
  { bg: "rgba(255,77,154,.18)", border: "rgba(255,77,154,.45)", color: "#ff8fbf" },
  { bg: "rgba(168,85,247,.18)", border: "rgba(168,85,247,.45)", color: "#d8b4fe" },
  { bg: "rgba(56,189,248,.18)", border: "rgba(56,189,248,.45)", color: "#7dd3fc" },
  { bg: "rgba(52,211,153,.18)", border: "rgba(52,211,153,.45)", color: "#6ee7b7" },
  { bg: "rgba(251,191,36,.18)", border: "rgba(251,191,36,.45)", color: "#fcd34d" },
];

const SVC_ACCENTS = [
  "linear-gradient(90deg,#ff4d9a,#a855f7)",
  "linear-gradient(90deg,#38bdf8,#34d399)",
  "linear-gradient(90deg,#fbbf24,#ff4d9a)",
  "linear-gradient(90deg,#a855f7,#38bdf8)",
];

function Pill({ children, i = 0 }) {
  const c = PILL_COLORS[i % PILL_COLORS.length];
  return (
    <span style={{
      display: "inline-flex", padding: "8px 14px", borderRadius: 999,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.color, fontSize: 13, fontWeight: 800,
    }}>
      {children}
    </span>
  );
}

export default function Home({ theme, brand, portfolio, services, testimonials }) {
  const featured = portfolio.filter((p) => p.featured).slice(0, 3);
  const showProjects = featured.length ? featured : portfolio.slice(0, 3);
  const showServices = services.slice(0, 3);

  return (
    <Layout
      title="Freelance Video Editor"
      description={brand.tagline}
      theme={theme}
      brand={brand}
      canonical={`https://${brand.domain}`}
    >
      <section className="hero-split glass-panel" style={{
        borderRadius: 36, padding: "52px 36px", display: "grid",
        gridTemplateColumns: "1.1fr .9fr", gap: 34, alignItems: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.35,
          background: "radial-gradient(circle at 85% 20%, rgba(255,77,154,.45), transparent 40%), radial-gradient(circle at 10% 80%, rgba(56,189,248,.35), transparent 42%)",
        }} />
        <div style={{ position: "relative" }}>
          <Pill i={0}>🎬 Available for hire</Pill>
          <h1 className="hero-title" style={{ fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.05em", fontWeight: 950, margin: "18px 0 18px" }}>
            {brand.lead}{" "}
            <span style={{
              background: "var(--hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {brand.accent}
            </span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 18, lineHeight: 1.8, marginBottom: 26, maxWidth: 620 }}>
            {brand.tagline}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <Link href="/contact" className="ff-btn ff-btn-primary">{brand.heroCta || "Hire me"} →</Link>
            <Link href="/portfolio" className="ff-btn ff-btn-soft">▶ View portfolio</Link>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["YouTube", "Reels", "Weddings", "Brand ads"].map((item, i) => (
              <Pill key={item} i={i + 1}>{item}</Pill>
            ))}
          </div>
        </div>

        <div className="hide-mobile" style={{ position: "relative" }}>
          <div style={{
            borderRadius: 28, overflow: "hidden",
            border: "2px solid transparent",
            background: "linear-gradient(var(--surface),var(--surface)) padding-box, var(--hero) border-box",
            boxShadow: "var(--glow)",
            animation: "ff-float 5s ease-in-out infinite",
          }}>
            {showProjects[0]?.thumbnail_url ? (
              <img
                src={showProjects[0].thumbnail_url}
                alt={showProjects[0].title}
                style={{ width: "100%", height: 290, objectFit: "cover" }}
              />
            ) : (
              <div style={{ height: 290, background: "var(--hero)" }} />
            )}
            <div style={{
              padding: 18,
              background: "linear-gradient(180deg, color-mix(in srgb, var(--surface) 90%, #a855f7), var(--surface))",
            }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--accent2)", marginBottom: 4 }}>
                Featured cut
              </div>
              <strong style={{ fontSize: 17 }}>{showProjects[0]?.title || "Featured edit"}</strong>
              <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
                {showProjects[0]?.description || "Cinematic storytelling for creators and brands."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-row" style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          ["50+", "Projects delivered"],
          ["24h", "Avg. reply time"],
          ["4.9★", "Client rating"],
          ["100%", "On-time delivery"],
        ].map(([n, l], i) => (
          <div key={l} className="ff-stat" style={{
            borderImage: `${SVC_ACCENTS[i % SVC_ACCENTS.length]} 1`,
          }}>
            <div style={{
              fontSize: 26, fontWeight: 950, letterSpacing: "-0.03em",
              background: SVC_ACCENTS[i % SVC_ACCENTS.length],
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {n}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 12, fontWeight: 700, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <section style={{ marginTop: 48 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, marginBottom: 20 }}>
          <div>
            <span className="ff-section-label">Selected work</span>
            <h2 style={{ fontSize: 32, fontWeight: 950, letterSpacing: "-0.04em", marginTop: 8 }}>Portfolio highlights</h2>
          </div>
          <Link href="/portfolio" className="ff-btn ff-btn-soft" style={{ padding: "8px 14px", fontSize: 13 }}>See all →</Link>
        </div>
        {showProjects.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Projects will appear here once added in the admin panel.</p>
        ) : (
          <div className="port-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {showProjects.map((item, i) => <ProjectCard key={item.id} item={item} accent={i} />)}
          </div>
        )}
      </section>

      <section style={{ marginTop: 52 }}>
        <span className="ff-section-label">What I offer</span>
        <h2 style={{ fontSize: 32, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 20px" }}>Services</h2>
        <div className="svc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {showServices.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>Services are managed from the CRM admin.</p>
          ) : showServices.map((svc, i) => (
            <div key={svc.id} className="card-hover" style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 24, padding: 0, overflow: "hidden",
            }}>
              <div style={{ height: 5, background: SVC_ACCENTS[i % SVC_ACCENTS.length] }} />
              <div style={{ padding: 22 }}>
                <h3 style={{ fontSize: 19, fontWeight: 900, marginBottom: 8 }}>{svc.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>{svc.description}</p>
                <div style={{
                  fontWeight: 900, fontSize: 15,
                  background: SVC_ACCENTS[i % SVC_ACCENTS.length],
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  {svc.price_label}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link href="/services" className="ff-btn ff-btn-soft" style={{ marginTop: 20, display: "inline-flex" }}>All packages</Link>
      </section>

      {testimonials.length > 0 && (
        <section style={{ marginTop: 52 }}>
          <span className="ff-section-label">Clients</span>
          <h2 style={{ fontSize: 32, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 20px" }}>What clients say</h2>
          <div className="feature-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {testimonials.slice(0, 3).map((t, i) => (
              <div key={t.id} style={{
                background: "linear-gradient(160deg, color-mix(in srgb, var(--surface) 90%, #a855f7), var(--surface))",
                border: "1px solid color-mix(in srgb, var(--accent) 30%, var(--border))",
                borderRadius: 24, padding: 22,
              }}>
                <div style={{
                  marginBottom: 10, fontSize: 16,
                  background: SVC_ACCENTS[i % SVC_ACCENTS.length],
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  {"★".repeat(t.rating || 5)}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 14 }}>&ldquo;{t.quote}&rdquo;</p>
                <strong>{t.client_name}</strong>
                {t.client_role && <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{t.client_role}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{
        marginTop: 52, borderRadius: 32, padding: "40px 28px", textAlign: "center",
        background: "var(--hero)",
        boxShadow: "var(--glow)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.2,
          background: "radial-gradient(circle at 20% 30%, #fff, transparent 40%), radial-gradient(circle at 80% 70%, #fff, transparent 35%)",
        }} />
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: 34, fontWeight: 950, letterSpacing: "-0.04em", marginBottom: 10, color: "#fff" }}>
            Ready to ship your next video?
          </h2>
          <p style={{ color: "rgba(255,255,255,.9)", maxWidth: 520, margin: "0 auto 22px", lineHeight: 1.7, fontWeight: 600 }}>
            Share your footage, deadline, and style references — I will reply with a clear plan and quote.
          </p>
          <Link href="/contact" className="ff-btn" style={{
            background: "#fff", color: "#7c1d6a", fontWeight: 900, boxShadow: "0 12px 30px rgba(0,0,0,.2)",
          }}>
            {brand.heroCta || "Hire me"} →
          </Link>
        </div>
      </section>
    </Layout>
  );
}
