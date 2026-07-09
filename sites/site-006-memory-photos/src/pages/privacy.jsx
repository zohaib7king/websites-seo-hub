import Layout from "../components/Layout.jsx";
import { getSite } from "../lib/data";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || "sunset" } };
}

const SECTIONS = [
  ["Overview", "This Privacy Policy explains how Remake Memory handles information when you visit the site or upload photos for processing."],
  ["Photos you upload", "Images submitted through the Photo Remake tool are used only to generate your requested result. They are not published on the website or shared with other users."],
  ["Temporary processing", "Uploaded files may be held briefly in server memory during AI processing, then discarded. We do not build a public gallery from your uploads."],
  ["Analytics & cookies", "We may use basic analytics to understand page traffic. Third-party ad partners may use cookies if advertising is enabled on the site."],
  ["Your choices", "Only upload photos you own or have permission to use. You can contact us to ask about data handling at any time."],
  ["Contact", "Privacy questions? Reach us through the Contact Us page."],
];

export default function Privacy({ theme }) {
  return (
    <Layout title="Privacy Policy" theme={theme}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 className="hero-title" style={{ fontSize: 34, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        {SECTIONS.map(([h, body]) => (
          <section key={h} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{h}</h2>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.8 }}>{body}</p>
          </section>
        ))}
      </div>
    </Layout>
  );
}
