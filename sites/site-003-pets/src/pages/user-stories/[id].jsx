import Layout from "../../components/Layout.jsx";
import ContentStats from "../../components/ContentStats.jsx";
import UserStoryCard from "../../components/UserStoryCard.jsx";
import Link from "next/link";
import { getSite, getUserPetStories } from "../../lib/data";
import { fmtDate } from "../../lib/seed";
import { SITE } from "../../site.config";

export async function getServerSideProps({ params }) {
  const [site, userStories] = await Promise.all([getSite(), getUserPetStories()]);
  const story = userStories.find(s => String(s.id) === String(params.id));
  if (!story) return { notFound: true };
  const related = userStories.filter(s => String(s.id) !== String(params.id)).slice(0, 3);
  return { props: { story, related, theme: site?.theme || SITE.defaultTheme || "petportal" } };
}

export default function UserStoryPage({ story, related, theme }) {
  const author = story.author_email ? story.author_email.split("@")[0] : "Pet Lover";

  return (
    <Layout title={story.title} theme={theme}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 18 }}>
          <Link href="/">Home</Link> <span>/</span> <Link href="/user-stories" style={{ color: "#22c55e" }}>User Pet Stories</Link>
        </div>

        <div style={{ fontSize: 12, fontWeight: 900, color: "#22c55e", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
          {story.pet_type || "Pet"} · Community Story
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 950, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 14 }}>{story.title}</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900 }}>
            {author.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{author}</div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>{fmtDate(story.created_at)}</div>
          </div>
          <ContentStats type="user-story" id={story.id} initialViews={story.view_count} initialLikes={story.like_count} />
        </div>

        {story.image_url && (
          <img src={story.image_url} alt={story.title} style={{ width: "100%", maxHeight: 420, objectFit: "cover", borderRadius: 20, marginBottom: 28 }} />
        )}

        <div style={{ fontSize: 17, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{story.content}</div>
      </div>

      {related?.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 950, marginBottom: 20 }}>More Community Stories</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
            {related.map(s => <UserStoryCard key={s.id} story={s} />)}
          </div>
        </section>
      )}
    </Layout>
  );
}
