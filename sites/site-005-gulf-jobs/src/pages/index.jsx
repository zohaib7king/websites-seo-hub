import Layout from "../components/Layout.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import Link from "next/link";
import { getSite, getPublishedArticles, catSlug } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const [site, articles] = await Promise.all([getSite(), getPublishedArticles()]);
  return { props: { articles, theme: site?.theme || SITE.defaultTheme || "royal" } };
}

const countries = ["UAE", "Saudi Arabia", "Oman", "Qatar", "Kuwait", "Bahrain"];
const clusters = [
  { title: "Gulf CV Format", text: "Build a recruiter-friendly CV for UAE, Saudi, Qatar and Oman roles.", href: "/category/cv" },
  { title: "Visa Basics", text: "Understand safer work permit and employer verification steps.", href: "/category/visas" },
  { title: "Walk-In Interviews", text: "Prepare documents, answers and follow-up for Gulf hiring events.", href: "/category/interviews" },
  { title: "Job Portals", text: "Use LinkedIn, GulfTalent, Bayt-style portals and alerts with a routine.", href: "/category/job-portals" },
];
const stats = [
  ["6", "Gulf countries covered"],
  ["5+", "practical starter guides"],
  ["3", "CV templates"],
];

function Pill({ children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px",
      borderRadius: 999, background: "#fff", border: "1px solid var(--border)",
      color: "var(--accent)", fontSize: 13, fontWeight: 800,
    }}>
      {children}
    </span>
  );
}

export default function Home({ articles, theme }) {
  const featured = articles[0];
  const latest = articles.slice(0, 4);
  const mostViewed = [...articles].sort((a, b) => Number(b.view_count || 0) - Number(a.view_count || 0)).slice(0, 4);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: `https://${SITE.domain}`,
    description: SITE.tagline,
    publisher: { "@type": "Organization", name: SITE.name },
    about: ["Gulf jobs", "CV maker", "UAE jobs", "Saudi Arabia jobs", "job search guides"],
  };

  return (
    <Layout
      title="Gulf Jobs, CV Maker and Career Guides"
      description="Create a professional Gulf CV and read practical job search guides for UAE, Saudi Arabia, Oman, Qatar, Kuwait and Bahrain."
      theme={theme}
      canonical={`https://${SITE.domain}`}
      schema={schema}
    >
      <section className="hero-portal glass-panel" style={{
        position: "relative", overflow: "hidden", borderRadius: 30, padding: "54px 34px",
        display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 34, alignItems: "center",
      }}>
        <div style={{ position: "absolute", inset: "auto -120px -180px auto", width: 360, height: 360, borderRadius: "50%", background: "rgba(14,165,233,.16)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Pill>Gulf career planning made practical</Pill>
          <h1 className="hero-title" style={{ fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.06em", margin: "18px 0 18px", fontWeight: 950 }}>
            Build a better CV and apply smarter for Gulf jobs.
          </h1>
          <p style={{ maxWidth: 640, color: "var(--muted)", fontSize: 18, lineHeight: 1.8, marginBottom: 26 }}>
            Professional guides for job seekers targeting the UAE, Saudi Arabia, Oman, Qatar, Kuwait and Bahrain. Learn how to prepare your CV, verify offers and avoid risky shortcuts.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 26 }}>
            <Link href="/cv-maker" className="career-btn career-btn-primary">Create Free CV</Link>
            <Link href={featured ? `/article/${featured.slug}` : "/category/cv"} className="career-btn career-btn-soft">Read Job Guides</Link>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {countries.map(country => <Pill key={country}>{country}</Pill>)}
          </div>
        </div>

        <div className="hide-mobile" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ background: "var(--hero)", borderRadius: 28, padding: 22, color: "#fff", boxShadow: "var(--glow)" }}>
            <div style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 22, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <strong style={{ fontSize: 18 }}>Professional CV Preview</strong>
                <span style={{ background: "#fff", color: "var(--accent)", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 900 }}>ATS-ready</span>
              </div>
              <div style={{ height: 10, width: "64%", background: "#fff", borderRadius: 999, marginBottom: 8 }} />
              <div style={{ height: 8, width: "42%", background: "rgba(255,255,255,.7)", borderRadius: 999, marginBottom: 22 }} />
              {["Experience", "Skills", "Education", "Languages"].map((label, index) => (
                <div key={label} style={{ marginBottom: 15 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", opacity: .85, marginBottom: 6 }}>{label}</div>
                  <div style={{ height: 8, width: `${86 - index * 10}%`, background: "rgba(255,255,255,.72)", borderRadius: 999 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, margin: "22px 0 34px" }}>
        {stats.map(([value, label]) => (
          <div key={label} className="glass-panel" style={{ borderRadius: 20, padding: 22 }}>
            <div style={{ fontSize: 32, lineHeight: 1, fontWeight: 950, color: "var(--accent)", marginBottom: 4 }}>{value}</div>
            <div style={{ color: "var(--muted)", fontWeight: 700 }}>{label}</div>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 42 }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 20, marginBottom: 18 }}>
          <div>
            <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>Start here</span>
            <h2 style={{ fontSize: 32, letterSpacing: "-0.04em", fontWeight: 950 }}>SEO-focused job search guides</h2>
          </div>
          <Link href="/cv-maker" className="career-btn career-btn-soft">Open CV Maker</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
          {clusters.map(item => (
            <Link key={item.title} href={item.href} className="card-hover" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 22, padding: 24 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: "color-mix(in srgb,var(--accent) 11%,#fff)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950, marginBottom: 16 }}>
                {item.title.charAt(0)}
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 900, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>{item.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="news-grid" style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 26 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 28, fontWeight: 950, letterSpacing: "-0.04em" }}>Latest Gulf career articles</h2>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <Link href="/articles" className="career-btn career-btn-soft" style={{ padding: "9px 14px", fontSize: 13 }}>View All</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 20 }}>
            {latest.map(article => <ArticleCard key={article.id} article={article} />)}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "36px 0 18px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 28, fontWeight: 950, letterSpacing: "-0.04em" }}>Most viewed guides</h2>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <Link href="/articles" className="career-btn career-btn-soft" style={{ padding: "9px 14px", fontSize: 13 }}>View All</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 20 }}>
            {mostViewed.map(article => <ArticleCard key={`popular-${article.id || article.slug}`} article={article} />)}
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="glass-panel" style={{ borderRadius: 22, padding: 24 }}>
            <h3 style={{ fontSize: 21, fontWeight: 950, marginBottom: 10 }}>Safe job search checklist</h3>
            <ul style={{ color: "var(--muted)", paddingLeft: 18, lineHeight: 1.9, fontSize: 14 }}>
              <li>Verify company name and official website.</li>
              <li>Never pay for guaranteed job promises.</li>
              <li>Keep CV, LinkedIn and documents consistent.</li>
              <li>Ask for written offer details before resigning.</li>
            </ul>
          </div>
          <div style={{ background: "var(--hero)", color: "#fff", borderRadius: 22, padding: 24, boxShadow: "var(--glow)" }}>
            <h3 style={{ fontSize: 22, fontWeight: 950, marginBottom: 8 }}>Need a Gulf-ready CV?</h3>
            <p style={{ color: "rgba(255,255,255,.86)", fontSize: 14, marginBottom: 16 }}>
              Fill your details, choose a template and print your CV as PDF from the browser.
            </p>
            <Link href="/cv-maker" className="career-btn" style={{ background: "#fff", color: "var(--accent)" }}>Make CV Now</Link>
          </div>
          {/* AdSense unit goes here */}
          <div className="ad-slot" style={{ minHeight: 250 }}>[ Ad Unit 300x250 ]</div>
        </aside>
      </section>
    </Layout>
  );
}
