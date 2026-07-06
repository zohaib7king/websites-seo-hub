import Link from "next/link";
import Layout from "../../components/Layout.jsx";
import { getEditorBundle, getSite, youtubeEmbed, isUploadedMedia } from "../../lib/data";
import { SITE } from "../../site.config";

const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || "site-007-video-editor";

export async function getServerSideProps({ params }) {
  const [site, bundle] = await Promise.all([getSite(), getEditorBundle()]);
  let project = bundle.portfolio.find((p) => p.slug === params.slug) || null;
  if (!project) {
    try {
      const res = await fetch(`${API}/api/video-editor/${SITE_ID}/portfolio/${params.slug}`);
      if (res.ok) project = await res.json();
    } catch { /* ignore */ }
  }
  if (!project || project.status === "draft") return { notFound: true };
  return {
    props: {
      theme: site?.theme || SITE.defaultTheme,
      brand: bundle.brand,
      project,
      related: bundle.portfolio.filter((p) => p.slug !== project.slug).slice(0, 3),
    },
  };
}

export default function ProjectPage({ theme, brand, project, related }) {
  const embed = youtubeEmbed(project.video_url);

  return (
    <Layout
      title={project.title}
      description={project.description || `${project.title} — edited by ${brand.name}`}
      theme={theme}
      brand={brand}
      canonical={`https://${brand.domain}/portfolio/${project.slug}`}
    >
      <Link href="/portfolio" style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>← Portfolio</Link>
      <div style={{ marginTop: 14, marginBottom: 10, color: "var(--accent2)", fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase" }}>
        {project.category || "Project"}{project.client_name ? ` · ${project.client_name}` : ""}
      </div>
      <h1 className="hero-title" style={{ fontSize: 40, fontWeight: 950, letterSpacing: "-0.04em", marginBottom: 14 }}>{project.title}</h1>
      {project.description && (
        <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.8, maxWidth: 760, marginBottom: 24 }}>{project.description}</p>
      )}

      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", background: "#000", marginBottom: 28 }}>
        {embed ? (
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              src={embed}
              title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          </div>
        ) : isUploadedMedia(project.video_url) ? (
          <video src={project.video_url} controls style={{ width: "100%", display: "block" }} poster={project.thumbnail_url || undefined} />
        ) : project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.title} style={{ width: "100%", display: "block" }} />
        ) : (
          <div style={{ height: 320, background: "var(--hero)" }} />
        )}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
        <Link href="/contact" className="ff-btn ff-btn-primary">Hire for a similar project</Link>
        {project.video_url && (
          <a href={project.video_url} target="_blank" rel="noreferrer" className="ff-btn ff-btn-soft">Open video</a>
        )}
      </div>

      {related.length > 0 && (
        <section>
          <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 14 }}>More work</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {related.map((item) => (
              <Link key={item.id} href={`/portfolio/${item.slug}`} style={{
                display: "block", padding: "14px 16px", borderRadius: 14,
                border: "1px solid var(--border)", background: "var(--surface)", fontWeight: 800,
              }}>
                {item.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
