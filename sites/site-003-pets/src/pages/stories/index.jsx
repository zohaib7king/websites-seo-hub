import Layout from "../../components/Layout.jsx";
import StoryCard from "../../components/StoryCard.jsx";
import Link from "next/link";
import { getSite, getPetStories } from "../../lib/data";
import { byViewsDesc } from "../../lib/seed";
import { SITE } from "../../site.config";

export async function getServerSideProps() {
  const [site, stories] = await Promise.all([getSite(), getPetStories()]);
  return { props: { stories, theme: site?.theme || SITE.defaultTheme || "sunset" } };
}

function groupByCategory(stories) {
  return stories.reduce((groups, story) => {
    const cat = story.category || "General";
    return { ...groups, [cat]: [...(groups[cat] || []), story] };
  }, {});
}

export default function Stories({ stories, theme }) {
  const grouped = groupByCategory(stories);
  const mostViewed = [...stories].sort(byViewsDesc);

  return (
    <Layout title="Pet History Stories" description="Fascinating history of cats, dogs, parrots, birds, rabbits, and more." theme={theme}>
      <section style={{ marginBottom: 30 }}>
        <span style={{ color: "#a855f7", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>Stories</span>
        <h1 className="hero-title" style={{ fontSize: 44, fontWeight: 950, letterSpacing: "-0.05em", margin: "8px 0 10px" }}>
          Pet history & fascinating stories
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.8, maxWidth: 760 }}>
          Discover how cats, dogs, parrots, chiriya, murga, and rabbits became our beloved companions through history.
        </p>
      </section>

      {mostViewed.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 18 }}>🔥 Most Viewed Stories</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
            {mostViewed.slice(0, 4).map(s => <StoryCard key={s.slug} story={s} />)}
          </div>
        </section>
      )}

      {Object.keys(grouped).sort().map(category => (
        <section key={category} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 950, marginBottom: 16, color: "#a855f7" }}>{category}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
            {grouped[category].map(s => <StoryCard key={s.slug} story={s} />)}
          </div>
        </section>
      ))}
    </Layout>
  );
}
