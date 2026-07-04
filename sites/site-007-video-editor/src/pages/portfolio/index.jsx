import Layout from "../../components/Layout.jsx";
import ProjectCard from "../../components/ProjectCard.jsx";
import { getEditorBundle, getSite } from "../../lib/data";
import { SITE } from "../../site.config";

export async function getServerSideProps() {
  const [site, bundle] = await Promise.all([getSite(), getEditorBundle()]);
  return {
    props: {
      theme: site?.theme || SITE.defaultTheme,
      brand: bundle.brand,
      portfolio: bundle.portfolio,
    },
  };
}

export default function Portfolio({ theme, brand, portfolio }) {
  const categories = [...new Set(portfolio.map((p) => p.category).filter(Boolean))];

  return (
    <Layout
      title="Portfolio"
      description={`Selected video editing work by ${brand.name}.`}
      theme={theme}
      brand={brand}
      canonical={`https://${brand.domain}/portfolio`}
    >
      <h1 className="hero-title" style={{ fontSize: 40, fontWeight: 950, letterSpacing: "-0.04em", marginBottom: 10 }}>Portfolio</h1>
      <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.7, maxWidth: 640, marginBottom: 18 }}>
        YouTube, social, weddings, events, and brand films — every project managed from the admin panel.
      </p>
      {categories.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {categories.map((c) => (
            <span key={c} style={{
              padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800,
              border: "1px solid var(--border)", color: "var(--muted)",
            }}>
              {c}
            </span>
          ))}
        </div>
      )}
      {portfolio.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No published projects yet.</p>
      ) : (
        <div className="port-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {portfolio.map((item) => <ProjectCard key={item.id} item={item} />)}
        </div>
      )}
    </Layout>
  );
}
