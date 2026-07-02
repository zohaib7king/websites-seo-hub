import Layout from "../components/Layout.jsx";
import Link from "next/link";
import { getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "sunset" } };
}

export default function About({ theme }) {
  return (
    <Layout title="About Us" description={`Learn about ${SITE.name} — pet care guides, history stories, and a loving community.`} theme={theme}>
      <section className="glass-panel" style={{ borderRadius: 28, padding: "42px 30px", marginBottom: 28 }}>
        <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>About Us</span>
        <h1 className="hero-title" style={{ fontSize: 44, fontWeight: 950, letterSpacing: "-0.05em", margin: "10px 0 14px" }}>
          Your colorful home for everything pets 🐾
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.85, maxWidth: 780 }}>
          {SITE.name} is a vibrant community for pet lovers. We publish vet-informed articles on health, nutrition, medicine, and housing — plus fascinating history stories about cats, dogs, birds, and more. Our members share their own pet stories with photos.
        </p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 22, marginBottom: 30 }}>
        {[
          ["📚 Pet Articles", "Expert guides on health, food, medicine, and pet housing.", "/articles"],
          ["📖 History Stories", "The fascinating history of cats, dogs, parrots, rabbits, and birds.", "/stories"],
          ["💚 Community", "Share your pet's story with photos — login to post and like.", "/user-stories"],
        ].map(([title, text, href]) => (
          <Link key={title} href={href} className="card-hover" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 22, padding: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 950, marginBottom: 8 }}>{title}</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.75 }}>{text}</p>
          </Link>
        ))}
      </div>

      <section style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 22, padding: 26 }}>
        <h2 style={{ fontSize: 26, fontWeight: 950, marginBottom: 12 }}>What we cover</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {(SITE.articleCategories || []).map(item => (
            <div key={item} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16, fontWeight: 800 }}>{item}</div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
