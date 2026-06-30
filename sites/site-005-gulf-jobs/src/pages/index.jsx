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

function formatCount(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return String(number);
}

export default function Home({ articles, theme }) {
  const featured = articles[0];
  const latest = articles.slice(0, 4);
  const mostViewed = [...articles].sort((a, b) => Number(b.view_count || 0) - Number(a.view_count || 0)).slice(0, 4);
  const totalViews = articles.reduce((sum, article) => sum + Number(article.view_count || 0), 0);
  const totalLikes = articles.reduce((sum, article) => sum + Number(article.like_count || 0), 0);
  const stats = [
    ["6", "Gulf countries covered"],
    [String(articles.length), "career guides live"],
    [formatCount(totalViews), "real article views"],
  ];
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
        position: "relative", overflow: "hidden", borderRadius: 34, padding: "54px 34px",
        display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 34, alignItems: "center",
        background: "linear-gradient(135deg,rgba(255,255,255,.92),rgba(239,246,255,.9) 48%,rgba(250,245,255,.92))",
      }}>
        <div style={{ position: "absolute", inset: "auto -120px -180px auto", width: 360, height: 360, borderRadius: "50%", background: "rgba(14,165,233,.16)" }} />
        <div style={{ position: "absolute", inset: "-160px auto auto -120px", width: 320, height: 320, borderRadius: "50%", background: "rgba(124,58,237,.12)" }} />
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
          <div style={{ background: "var(--hero)", borderRadius: 30, padding: 18, color: "#fff", boxShadow: "var(--glow)" }}>
            {featured && (
              <Link href={`/article/${featured.slug}`} style={{ display: "block", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 24, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ height: 150, background: featured.image_url ? `linear-gradient(rgba(15,23,42,.12),rgba(15,23,42,.36)),url(${featured.image_url}) center/cover` : "rgba(255,255,255,.16)" }} />
                <div style={{ padding: 18 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ background: "#fff", color: "var(--accent)", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 900 }}>Featured</span>
                    <span style={{ color: "rgba(255,255,255,.82)", fontSize: 12, fontWeight: 800 }}>{featured.category}</span>
                  </div>
                  <h2 style={{ fontSize: 22, lineHeight: 1.18, letterSpacing: "-0.04em", fontWeight: 950, marginBottom: 10 }}>{featured.title}</h2>
                  <div style={{ display: "flex", gap: 10, color: "rgba(255,255,255,.84)", fontSize: 12, fontWeight: 900 }}>
                    <span>{formatCount(featured.view_count)} views</span>
                    <span>{formatCount(featured.like_count)} likes</span>
                  </div>
                </div>
              </Link>
            )}
            <div style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 22, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <strong style={{ fontSize: 17 }}>Live reader activity</strong>
                <span style={{ background: "#fff", color: "var(--accent)", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 900 }}>Real counts</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  [formatCount(totalViews), "total views"],
                  [formatCount(totalLikes), "total likes"],
                ].map(([value, label]) => (
                  <div key={label} style={{ background: "rgba(255,255,255,.16)", borderRadius: 18, padding: 14 }}>
                    <div style={{ fontSize: 24, fontWeight: 950, lineHeight: 1 }}>{value}</div>
                    <div style={{ color: "rgba(255,255,255,.78)", fontSize: 12, fontWeight: 800, marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
              <Link href="/cv-maker" className="career-btn" style={{ background: "#fff", color: "var(--accent)", width: "100%", marginTop: 14 }}>
                Build a Gulf CV
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{
        margin: "22px 0 0",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
        gap: 14,
      }}>
        {[
          ["CV Maker", "Free and paid templates for Gulf applicants", "/cv-maker"],
          ["All Articles", "Browse every guide by category", "/articles"],
          ["Most Viewed", "See what readers are opening now", featured ? `/article/${featured.slug}` : "/articles"],
        ].map(([title, text, href]) => (
          <Link key={title} href={href} className="card-hover" style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 22,
            padding: 18,
            boxShadow: "0 14px 35px rgba(15,23,42,.05)",
          }}>
            <div style={{ color: "var(--accent)", fontWeight: 950, marginBottom: 4 }}>{title}</div>
            <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.55 }}>{text}</div>
          </Link>
        ))}
      </section>

      <section className="stats-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16,
        margin: "22px 0 34px",
        padding: 18,
        borderRadius: 26,
        background: "linear-gradient(135deg,rgba(255,255,255,.7),rgba(239,246,255,.9))",
        border: "1px solid rgba(226,232,240,.9)",
      }}>
        {stats.map(([value, label]) => (
          <div key={label} className="glass-panel" style={{ borderRadius: 20, padding: 22 }}>
            <div style={{ fontSize: 32, lineHeight: 1, fontWeight: 950, color: "var(--accent)", marginBottom: 4 }}>{value}</div>
            <div style={{ color: "var(--muted)", fontWeight: 700 }}>{label}</div>
          </div>
        ))}
      </section>

      <section style={{
        marginBottom: 42,
        borderRadius: 30,
        padding: 26,
        background: "linear-gradient(135deg,#fff 0%,rgba(250,245,255,.92) 100%)",
        border: "1px solid rgba(226,232,240,.9)",
        boxShadow: "0 18px 50px rgba(91,33,182,.06)",
      }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 20, marginBottom: 18 }}>
          <div>
            <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>Start here</span>
            <h2 style={{ fontSize: 32, letterSpacing: "-0.04em", fontWeight: 950 }}>SEO-focused job search guides</h2>
          </div>
          <Link href="/cv-maker" className="career-btn career-btn-soft">Open CV Maker</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
          {clusters.map(item => (
            <Link key={item.title} href={item.href} className="card-hover" style={{ background: "rgba(255,255,255,.92)", border: "1px solid var(--border)", borderRadius: 22, padding: 24 }}>
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
          <div style={{
            borderRadius: 30,
            padding: 24,
            background: "linear-gradient(135deg,rgba(255,255,255,.96),rgba(236,253,245,.9))",
            border: "1px solid rgba(209,250,229,.9)",
            marginBottom: 26,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 28, fontWeight: 950, letterSpacing: "-0.04em" }}>Latest Gulf career articles</h2>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <Link href="/articles" className="career-btn career-btn-soft" style={{ padding: "9px 14px", fontSize: 13 }}>View All</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 20 }}>
              {latest.map(article => <ArticleCard key={article.id} article={article} />)}
            </div>
          </div>

          <div style={{
            borderRadius: 30,
            padding: 24,
            background: "linear-gradient(135deg,rgba(255,255,255,.96),rgba(255,247,237,.92))",
            border: "1px solid rgba(254,215,170,.85)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 28, fontWeight: 950, letterSpacing: "-0.04em" }}>Most viewed guides</h2>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <Link href="/articles" className="career-btn career-btn-soft" style={{ padding: "9px 14px", fontSize: 13 }}>View All</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 20 }}>
              {mostViewed.map(article => <ArticleCard key={`popular-${article.id || article.slug}`} article={article} />)}
            </div>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="glass-panel" style={{ borderRadius: 22, padding: 24, background: "linear-gradient(135deg,rgba(255,255,255,.92),rgba(239,246,255,.9))" }}>
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
