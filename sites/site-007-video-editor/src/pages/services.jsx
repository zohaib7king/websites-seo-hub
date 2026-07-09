import Link from "next/link";
import Layout from "../components/Layout.jsx";
import { getEditorBundle, getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const [site, bundle] = await Promise.all([getSite(), getEditorBundle()]);
  return {
    props: {
      theme: site?.theme || SITE.defaultTheme,
      brand: bundle.brand,
      services: bundle.services,
    },
  };
}

export default function Services({ theme, brand, services }) {
  return (
    <Layout
      title="Services"
      description={`Video editing packages from ${brand.name}.`}
      theme={theme}
      brand={brand}
      canonical={`https://${brand.domain}/services`}
    >
      <h1 className="hero-title" style={{ fontSize: 40, fontWeight: 950, letterSpacing: "-0.04em", marginBottom: 10 }}>Services & packages</h1>
      <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.7, maxWidth: 640, marginBottom: 28 }}>
        Clear packages for creators and businesses. Pricing and features are updated from the admin panel.
      </p>

      {services.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No services published yet.</p>
      ) : (
        <div className="svc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}>
          {services.map((svc) => (
            <div key={svc.id} className="glass-panel" style={{ borderRadius: 24, padding: 26 }}>
              <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 8 }}>{svc.title}</h2>
              <div style={{ color: "var(--accent2)", fontWeight: 800, marginBottom: 12 }}>{svc.price_label}</div>
              <p style={{ color: "var(--muted)", lineHeight: 1.75, marginBottom: 16 }}>{svc.description}</p>
              {Array.isArray(svc.features) && svc.features.length > 0 && (
                <ul style={{ listStyle: "none", display: "grid", gap: 8, marginBottom: 18 }}>
                  {svc.features.map((f) => (
                    <li key={f} style={{ fontSize: 14, fontWeight: 700 }}>✓ {f}</li>
                  ))}
                </ul>
              )}
              <Link href="/contact" className="ff-btn ff-btn-primary" style={{ display: "inline-flex" }}>Request quote</Link>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
