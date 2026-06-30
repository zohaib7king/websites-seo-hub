import Layout from "../components/Layout.jsx";
import { getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "royal" } };
}

const SECTIONS = [
  ["Overview", "This Privacy Policy explains how we collect, use, and protect information when you visit this website. By using the site you agree to the practices described here."],
  ["Information We Collect", "We collect non-personal data such as browser type, pages visited, and time spent on the site through analytics tools. We only collect personal information (like your email) if you voluntarily provide it."],
  ["Cookies & Advertising", "We use cookies to improve your experience. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet. You may opt out of personalized advertising by visiting Google Ads Settings."],
  ["Third-Party Services", "We may use services such as Google AdSense and Google Analytics. These providers have their own privacy policies governing how they handle data."],
  ["Your Choices", "You can disable cookies in your browser settings and opt out of personalized ads at any time. Doing so will not prevent you from using the site."],
  ["Contact", "If you have questions about this Privacy Policy, please reach us through our Contact page."],
];

export default function Privacy({ theme }) {
  return (
    <Layout title="Privacy Policy" description={`Privacy policy for ${SITE.name}.`} theme={theme} canonical={`https://${SITE.domain}/privacy`}>
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
