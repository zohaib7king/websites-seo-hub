import Link from "next/link";
import { ArticleCard as UIArticleCard } from "@zoyzoy/ui";

// Adopts the shared @zoyzoy/ui ArticleCard, wrapped in next/link so each card
// is a real crawlable <a href> (SEO/AdSense). The theme's hero gradient is used
// for the no-image placeholder.
export default function ArticleCard({ article }) {
  return (
    <Link href={`/article/${article.slug}`} style={{ display: "block", height: "100%" }}>
      <UIArticleCard article={article} heroGradient="var(--hero)" />
    </Link>
  );
}
