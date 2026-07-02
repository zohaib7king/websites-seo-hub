import Layout from "../../components/Layout.jsx";
import UserStoryCard from "../../components/UserStoryCard.jsx";
import Link from "next/link";
import { getSite, getUserPetStories } from "../../lib/data";
import { byViewsDesc } from "../../lib/seed";
import { SITE } from "../../site.config";

export async function getServerSideProps() {
  const [site, userStories] = await Promise.all([getSite(), getUserPetStories()]);
  return { props: { userStories, theme: site?.theme || SITE.defaultTheme || "sunset" } };
}

export default function UserStories({ userStories, theme }) {
  const mostViewed = [...userStories].sort(byViewsDesc);

  return (
    <Layout title="User Pet Stories" description="Community pet stories shared by pet lovers with photos." theme={theme}>
      <section style={{ marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span style={{ color: "#22c55e", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>Community</span>
          <h1 className="hero-title" style={{ fontSize: 44, fontWeight: 950, letterSpacing: "-0.05em", margin: "8px 0 10px" }}>
            User Pet Stories
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.8, maxWidth: 600 }}>
            Real stories from pet lovers. Login to share your own pet story with photos!
          </p>
        </div>
        <Link href="/user-stories/submit" className="pet-btn pet-btn-primary" style={{ flexShrink: 0 }}>+ Share Your Story</Link>
      </section>

      {mostViewed.length > 0 ? (
        <>
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 18 }}>🔥 Most Viewed</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
              {mostViewed.slice(0, 4).map(s => <UserStoryCard key={s.id} story={s} />)}
            </div>
          </section>
          <section>
            <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 18 }}>All Community Stories</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
              {mostViewed.map(s => <UserStoryCard key={s.id} story={s} />)}
            </div>
          </section>
        </>
      ) : (
        <div style={{ background: "#fff", border: "1px dashed var(--border)", borderRadius: 24, padding: 50, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🐾</div>
          <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 10 }}>No stories yet</h2>
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>Be the first to share your pet's story with the community!</p>
          <Link href="/user-stories/submit" className="pet-btn pet-btn-primary">Share Your Pet Story</Link>
        </div>
      )}
    </Layout>
  );
}
