import React from "react";
import { ArticleCard } from "@zoyzoy/ui";

export const WithImage = () => (
  <div style={{ padding: 24, width: 340 }}>
    <ArticleCard
      article={{
        title: "The Best AI Tools to Watch in 2025",
        meta_desc: "A roundup of the AI products reshaping how teams write, design, and ship.",
        category: "Artificial Intelligence",
        image_url:
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=640&q=80",
        published_at: "2025-03-12",
        ai_generated: true,
      }}
    />
  </div>
);

export const Placeholder = () => (
  <div style={{ padding: 24, width: 340 }}>
    <ArticleCard
      article={{
        title: "How to Budget on an Irregular Income",
        meta_desc: "Practical tactics for freelancers and creators with variable monthly earnings.",
        category: "Personal Finance",
        published_at: "2025-02-28",
        ai_generated: true,
      }}
      heroGradient="linear-gradient(135deg,#10b981 0%,#84cc16 100%)"
    />
  </div>
);
