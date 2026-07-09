import Layout from "../components/Layout.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import StoryCard from "../components/StoryCard.jsx";
import UserStoryCard from "../components/UserStoryCard.jsx";
import Link from "next/link";
import { getSite, getPublishedArticles, getPetStories, getUserPetStories } from "../lib/data";
import { formatCount, byViewsDesc } from "../lib/seed";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const [site, articles, stories, userStories] = await Promise.all([
    getSite(), getPublishedArticles(), getPetStories(), getUserPetStories(),
  ]);
  return {
    props: {
      articles, stories, userStories,
      theme: site?.theme || SITE.defaultTheme || "petportal",
    },
  };
}

function SectionHeader({ title, subtitle, href, linkLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 950, letterSpacing: "-0.04em", marginBottom: 4, color: "#0f172a" }}>{title}</h2>
        {subtitle && <p style={{ color: "#64748b", fontSize: 15 }}>{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="pet-btn pet-btn-soft" style={{ flexShrink: 0 }}>
          {linkLabel || "View All →"}
        </Link>
      )}
    </div>
  );
}

export default function Home({ articles, stories, userStories, theme }) {
  const mostViewedArticles = [...articles].sort(byViewsDesc).slice(0, 4);
  const mostViewedStories = [...stories].sort(byViewsDesc).slice(0, 4);
  const topUserStories = [...userStories].sort(byViewsDesc).slice(0, 4);
  const totalViews = articles.reduce((s, a) => s + Number(a.view_count || 0), 0);

  return (
    <Layout title="Pet Care, Stories & Community" description={SITE.tagline} theme={theme}>
      {/* Pet banner — first section with large images */}
      <section className="glass-panel" style={{ borderRadius: 28, padding: "28px 24px 24px", marginBottom: 32, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", inset: "-60px auto auto -60px", width: 200, height: 200, borderRadius: "50%", background: "rgba(249,115,22,.12)" }} />
        <div style={{ position: "absolute", inset: "auto -40px -80px auto", width: 240, height: 240, borderRadius: "50%", background: "rgba(168,85,247,.10)" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginBottom: 24 }}>
          <span style={{ display: "inline-block", background: "linear-gradient(90deg,#f97316,#fb7185)", color: "#fff", borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 14 }}>
            Welcome to the colorful world of pets
          </span>
          <h1 className="hero-title" style={{ fontSize: 48, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.08, marginBottom: 12, color: "#0f172a" }}>
            {SITE.lead}{" "}
            <span style={{ background: "linear-gradient(90deg,#ea580c,#db2777,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {SITE.accent}
            </span>
          </h1>
          <p style={{ color: "#64748b", fontSize: 17, lineHeight: 1.75, maxWidth: 640, margin: "0 auto 20px" }}>{SITE.tagline}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/articles" className="pet-btn pet-btn-primary">Browse Articles</Link>
            <Link href="/stories" className="pet-btn pet-btn-soft">Pet History Stories</Link>
          </div>
        </div>

        {/* Large pet image grid */}
        <div className="banner-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, position: "relative", zIndex: 1 }}>
          {SITE.bannerPets.map(pet => (
            <div key={pet.name} style={{ borderRadius: 20, overflow: "hidden", border: `3px solid ${pet.color}`, boxShadow: `0 12px 30px ${pet.color}33`, position: "relative" }}>
              <img src={pet.image} alt={pet.name} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `linear-gradient(transparent,${pet.color}dd)`, padding: "20px 10px 8px", textAlign: "center" }}>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>{pet.emoji} {pet.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginTop: 22, position: "relative", zIndex: 1 }}>
          {[
            [String(articles.length), "Pet articles"],
            [String(stories.length), "History stories"],
            [formatCount(totalViews), "Article views"],
            [String(userStories.length), "Community stories"],
          ].map(([val, label]) => (
            <div key={label} style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,.04)" }}>
              <div style={{ fontSize: 26, fontWeight: 950, color: "#ea580c" }}>{val}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Most viewed articles */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader
          title="🔥 Most Viewed Pet Articles"
          subtitle="Expert guides on health, food, medicine, and pet care"
          href="/articles"
          linkLabel="All Articles →"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
          {mostViewedArticles.map(a => <ArticleCard key={a.slug} article={a} />)}
        </div>
      </section>

      {/* Most viewed pet history stories */}
      <section style={{ marginBottom: 40, background: "linear-gradient(135deg,rgba(168,85,247,.06),rgba(236,72,153,.04))", borderRadius: 24, padding: "28px 24px", border: "1px solid #e2e8f0" }}>
        <SectionHeader
          title="📖 Pet History Stories"
          subtitle="The fascinating history of cats, dogs, birds, and more"
          href="/stories"
          linkLabel="All Stories →"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
          {mostViewedStories.map(s => <StoryCard key={s.slug} story={s} />)}
        </div>
      </section>

      {/* User pet stories */}
      <section style={{ marginBottom: 20 }}>
        <SectionHeader
          title="💚 Community Pet Stories"
          subtitle="Real stories shared by pet lovers — login to share yours!"
          href="/user-stories"
          linkLabel="All User Stories →"
        />
        {topUserStories.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
            {topUserStories.map(s => <UserStoryCard key={s.id} story={s} />)}
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px dashed #cbd5e1", borderRadius: 20, padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐾</div>
            <p style={{ color: "#64748b", fontSize: 16, marginBottom: 16 }}>No community stories yet. Be the first to share your pet's story!</p>
            <Link href="/user-stories/submit" className="pet-btn pet-btn-primary">Share Your Pet Story</Link>
          </div>
        )}
      </section>
    </Layout>
  );
}
