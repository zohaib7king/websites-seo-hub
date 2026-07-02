import Layout from "../components/Layout.jsx";
import Link from "next/link";
import { getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "sunset" } };
}

export default function HowItWorks({ theme }) {
  return (
    <Layout
      title="How It Works"
      description="Learn the real Remake Memory workflow: count people, label them A-G, upload matching portraits, and generate the remake."
      theme={theme}
      canonical={`https://${SITE.domain}/how-it-works`}
    >
      <section className="glass-panel" style={{ marginBottom: 32, borderRadius: 30, padding: "30px 24px" }}>
        <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>How it works</span>
        <h1 className="hero-title" style={{ fontSize: 40, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 12px" }}>
          The right way to remake a childhood photo
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.8, maxWidth: 720 }}>
          Remake Memory works best when you treat the old photo like a left-to-right lineup. Count the visible people, match each one with a new portrait, then generate the remake in the same order.
        </p>
      </section>

      <div className="step-grid" style={{ display: "grid", gap: 24 }}>
        {[
          {
            step: 1,
            title: "Upload the original childhood image",
            text: "Choose the old photo exactly as it appears. The AI needs to see the real scene, pose, and face positions before any replacement happens.",
            image: "https://picsum.photos/seed/rm-step-a/700/480",
          },
          {
            step: 2,
            title: "Count every visible person",
            text: "If the old image has 4 visible people, set the people count to 4. The tool then unlocks upload slots A, B, C, and D for those exact positions.",
            image: "https://picsum.photos/seed/rm-step-b/700/480",
          },
          {
            step: 3,
            title: "Upload current portraits in left-to-right order",
            text: "Person A should match the first visible face on the left, person B the second, and so on. This is the most important step for getting a believable remake.",
            image: "https://picsum.photos/seed/rm-step-c/700/480",
          },
          {
            step: 4,
            title: "Generate, review, and retry if needed",
            text: "The AI applies the new portraits to the old scene. If the output is weak, try a clearer source image, tighter portrait crop, or fewer faces first.",
            image: "https://picsum.photos/seed/rm-step-d/700/480",
          },
        ].map(step => (
          <section key={step.step} className="glass-panel" style={{ borderRadius: 26, padding: 22, display: "grid", gridTemplateColumns: "280px 1fr", gap: 22, alignItems: "center" }}>
            <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)" }}>
              <img src={step.image} alt={step.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
            </div>
            <div>
              <span style={{ display: "inline-flex", width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center", background: "var(--hero)", color: "#fff", fontWeight: 900, marginBottom: 10 }}>
                {step.step}
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 8 }}>{step.title}</h2>
              <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.75 }}>{step.text}</p>
            </div>
          </section>
        ))}
      </div>

      <section style={{ marginTop: 36, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, padding: 26 }}>
        <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 12 }}>What gives the best result</h2>
        <ul style={{ color: "var(--muted)", paddingLeft: 20, lineHeight: 1.9, fontSize: 15 }}>
          <li>Use a clear scan or sharp phone shot of the old photo with low glare.</li>
          <li>Current portraits should be front-facing, well lit, and tightly framed around the face.</li>
          <li>Always upload portraits in the same left-to-right order as people appear in the old image.</li>
          <li>Start with 1-2 people first if the original group photo is crowded or blurry.</li>
          <li>No tool can promise a perfectly identical remake every time, but better input images make a big difference.</li>
        </ul>
        <Link href="/photo-remake" className="memory-btn memory-btn-primary" style={{ marginTop: 18, display: "inline-flex" }}>Start Now</Link>
      </section>
    </Layout>
  );
}
