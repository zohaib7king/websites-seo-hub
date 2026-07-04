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

function Pill({ children }) {
  return (
    <span style={{
      display: "inline-flex", padding: "7px 12px", borderRadius: 999,
      background: "color-mix(in srgb,var(--accent) 12%,transparent)",
      border: "1px solid color-mix(in srgb,var(--accent) 28%,transparent)",
      color: "var(--accent2)", fontSize: 13, fontWeight: 800,
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
        borderRadius: 34, padding: "48px 32px", display: "grid",
        gridTemplateColumns: "1.1fr .9fr", gap: 32, alignItems: "center",
      }}>
        <div>
          <Pill>Available for hire</Pill>
          <h1 className="hero-title" style={{ fontSize: 54, lineHeight: 1.04, letterSpacing: "-0.05em", fontWeight: 950, margin: "16px 0 18px" }}>
            {brand.lead}{" "}
            <span style={{ background: "var(--hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {brand.accent}
            </span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 18, lineHeight: 1.8, marginBottom: 24, maxWidth: 620 }}>
            {brand.tagline}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
            <Link href="/contact" className="ff-btn ff-btn-primary">{brand.heroCta || "Hire me"}</Link>
            <Link href="/portfolio" className="ff-btn ff-btn-soft">View portfolio</Link>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["YouTube", "Reels", "Weddings", "Brand ads"].map((item) => <Pill key={item}>{item}</Pill>)}
          </div>
        </div>

        <div className="hide-mobile">
          <div style={{ borderRadius: 28, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--glow)" }}>
            {showProjects[0]?.thumbnail_url ? (
              <img
                src={showProjects[0].thumbnail_url}
                alt={showProjects[0].title}
                style={{ width: "100%", height: 280, objectFit: "cover" }}
              />
            ) : (
              <div style={{ height: 280, background: "var(--hero)" }} />
            )}
            <div style={{ padding: 16, background: "var(--surface)" }}>
              <strong>{showProjects[0]?.title || "Featured edit"}</strong>
              <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
                {showProjects[0]?.description || "Cinematic storytelling for creators and brands."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 42 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, marginBottom: 18 }}>
          <div>
            <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>Selected work</span>
            <h2 style={{ fontSize: 30, fontWeight: 950, letterSpacing: "-0.04em", marginTop: 8 }}>Portfolio highlights</h2>
          </div>
          <Link href="/portfolio" style={{ color: "var(--accent2)", fontWeight: 800, fontSize: 14 }}>See all →</Link>
        </div>
        {showProjects.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Projects will appear here once added in the admin panel.</p>
        ) : (
          <div className="port-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {showProjects.map((item) => <ProjectCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      <section style={{ marginTop: 48 }}>
        <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>What I offer</span>
        <h2 style={{ fontSize: 30, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 18px" }}>Services</h2>
        <div className="svc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {showServices.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>Services are managed from the CRM admin.</p>
          ) : showServices.map((svc) => (
            <div key={svc.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, padding: 22 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>{svc.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{svc.description}</p>
              <div style={{ color: "var(--accent2)", fontWeight: 800, fontSize: 14 }}>{svc.price_label}</div>
            </div>
          ))}
        </div>
        <Link href="/services" className="ff-btn ff-btn-soft" style={{ marginTop: 18, display: "inline-flex" }}>All packages</Link>
      </section>

      {testimonials.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>Clients</span>
          <h2 style={{ fontSize: 30, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 18px" }}>What clients say</h2>
          <div className="feature-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {testimonials.slice(0, 3).map((t) => (
              <div key={t.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, padding: 22 }}>
                <div style={{ color: "var(--accent2)", marginBottom: 10 }}>{"★".repeat(t.rating || 5)}</div>
                <p style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 14 }}>&ldquo;{t.quote}&rdquo;</p>
                <strong>{t.client_name}</strong>
                {t.client_role && <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{t.client_role}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{
        marginTop: 48, borderRadius: 30, padding: 32, background: "var(--surface)",
        border: "1px solid var(--border)", textAlign: "center",
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 950, letterSpacing: "-0.04em", marginBottom: 10 }}>Ready to ship your next video?</h2>
        <p style={{ color: "var(--muted)", maxWidth: 520, margin: "0 auto 20px", lineHeight: 1.7 }}>
          Share your footage, deadline, and style references — I will reply with a clear plan and quote.
        </p>
        <Link href="/contact" className="ff-btn ff-btn-primary">{brand.heroCta || "Hire me"}</Link>
      </section>
    </Layout>
  );
}
