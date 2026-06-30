import { SITE } from "../site.config";

export async function getServerSideProps({ res }) {
  const baseUrl = `https://${SITE.domain}`;
  const robots = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n");

  res.setHeader("Content-Type", "text/plain");
  res.write(robots);
  res.end();

  return { props: {} };
}

export default function Robots() {
  return null;
}
