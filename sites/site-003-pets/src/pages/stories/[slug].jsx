import Layout from "../../components/Layout.jsx";
import ContentStats from "../../components/ContentStats.jsx";
import StoryCard from "../../components/StoryCard.jsx";
import Link from "next/link";
import { getSite, getPetStories } from "../../lib/data";
import { fmtDate, readingTime } from "../../lib/seed";
import { SITE } from "../../site.config";

export async function getServerSideProps({ params }) {
  const [site, stories] = await Promise.all([getSite(), getPetStories()]);
  const story = stories.find(s => s.slug === params.slug);
  if (!story) return { notFound: true };
  const related = stories.filter(s => s.slug !== story.slug).slice(0, 3);
  return { props: { story, related, theme: site?.theme || SITE.defaultTheme || "sunset" } };
}

const STORY_CSS = `
.story-body{font-size:17px;line-height:1.8;color:var(--text);}
.story-body h2{font-size:1.5em;font-weight:800;margin:1.9em 0 .6em;}
.story-body p{margin:0 0 1.25em;}
.story-body ul{margin:0 0 1.3em 1.4em;}
.story-body blockquote{margin:1.7em 0;padding:18px 22px;border-left:4px solid #a855f7;background:rgba(168,85,247,.08);border-radius:0 12px 12px 0;}
`;

export default function StoryPage({ story, related, theme }) {
  const mins = readingTime(story.content);

  return (
    <Layout title={story.title} description={story.excerpt} theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: STORY_CSS }} />

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 18 }}>
          <Link href="/">Home</Link> <span>/</span> <Link href="/stories" style={{ color: "#a855f7" }}>Stories</Link>
        </div>

        <div style={{ fontSize: 12, fontWeight: 900, color: "#a855f7", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>{story.category}</div>
        <h1 style={{ fontSize: 40, fontWeight: 950, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 14 }}>{story.title}</h1>
        {story.excerpt && <p style={{ fontSize: 18, color: "var(--muted)", lineHeight: 1.7, marginBottom: 22 }}>{story.excerpt}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{story.author || "Pet Historian"}</div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>{fmtDate(story.published_at)} · {mins} min read</div>
          </div>
          <ContentStats type="story" slug={story.slug} initialViews={story.view_count} initialLikes={story.like_count} />
        </div>

        {story.image_url && (
          <img src={story.image_url} alt={story.title} style={{ width: "100%", height: 380, objectFit: "cover", borderRadius: 20, marginBottom: 28 }} />
        )}

        <div className="story-body" dangerouslySetInnerHTML={{ __html: story.content }} />
      </div>

      {related?.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 950, marginBottom: 20 }}>More Pet Stories</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
            {related.map(s => <StoryCard key={s.slug} story={s} />)}
          </div>
        </section>
      )}
    </Layout>
  );
}
