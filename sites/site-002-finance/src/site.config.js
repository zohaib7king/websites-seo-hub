// Per-site identity + seed content. The ONLY file that differs between sites.
import { makeArticle } from "./lib/seed";

const financeArticles = [
  makeArticle({
    slug: "where-smart-money-is-moving-mid-2026",
    title: "Where Smart Money Is Moving in Mid-2026",
    category: "Investing", date: "2026-06-19", author: "Jordan Blake",
    excerpt: "Rates, AI capex, and a cooling consumer are reshaping allocations. Here's what the data actually shows.",
    tags: ["markets", "allocation", "strategy"],
    data: { value: "4.1%", label: "10-year Treasury yield as of mid-2026" },
    lead: "Every cycle has a narrative, and 2026's is 'higher for longer, but selectively.' Beneath the headlines, allocations are quietly shifting.",
    takeaway: "Don't chase the narrative — chase the cash flows. Quality balance sheets outperform when money costs something.",
    sections: [
      { h: "What's changing", p: ["Yields that actually pay have pulled money back toward bonds and cash equivalents."],
        list: ["Short-duration bonds are paying real income again", "Profitable, low-debt companies are back in favor", "Speculative growth needs a clearer path to earnings"] },
      { h: "What to watch", p: ["Watch the consumer and credit spreads — they crack before the index does."] },
    ],
    conclusion: "Diversify across quality, keep some dry powder, and let income do more of the work this year.",
  }),
  makeArticle({
    slug: "50-30-20-budget-still-works-2026",
    title: "The 50/30/20 Budget Still Works — If You Tweak It",
    category: "Budgeting", date: "2026-06-16", author: "Maya Torres",
    excerpt: "The classic rule needs an update for higher rents and lumpy incomes. Here's the modern version.",
    tags: ["budgeting", "basics", "saving"],
    lead: "The 50/30/20 rule — needs, wants, savings — is still the simplest budget that works. But the original ratios assume a world that no longer exists for most people.",
    takeaway: "A budget you actually follow beats a perfect one you abandon. Adjust the ratios, not the discipline.",
    sections: [
      { h: "The modern split", p: ["In high-cost cities, needs often exceed 50%. That's fine — adjust the wants, protect the savings."],
        list: ["Needs 55–60% where rent is high", "Wants flex down first when money's tight", "Savings 15–20%, automated on payday"] },
      { h: "Make it automatic", p: ["Move savings the day you're paid, before you can spend it. Automation beats willpower every time."] },
    ],
    conclusion: "Pick ratios that fit your real life, automate the savings, and revisit every few months.",
  }),
  makeArticle({
    slug: "high-yield-savings-vs-t-bills-2026",
    title: "High-Yield Savings vs T-Bills: Where to Park Cash Now",
    category: "Saving", date: "2026-06-11", author: "Jordan Blake",
    excerpt: "Both are safe and paying real yields. The right choice comes down to access, taxes, and effort.",
    tags: ["cash", "savings", "bonds"],
    lead: "For the first time in years, your emergency fund can earn a meaningful return. The question is where to keep it.",
    takeaway: "Use a high-yield savings account for money you might need this month; use T-bills for cash you can lock up a little longer.",
    sections: [
      { h: "Quick comparison", p: ["The yields are close; the differences are practical."],
        list: ["HYSA: instant access, simple, FDIC-insured", "T-bills: slightly higher yield, state-tax-free, fixed term", "Both beat a checking account by a wide margin"] },
      { h: "A simple split", p: ["Keep one month of expenses liquid in a HYSA, then ladder the rest into short T-bills."] },
    ],
    conclusion: "Don't let cash sit idle. Either option turns your safety net into a small income stream.",
  }),
  makeArticle({
    slug: "crypto-in-a-portfolio-how-much-2026",
    title: "Crypto in a Portfolio: How Much Is Too Much?",
    category: "Crypto", date: "2026-06-05", author: "Priya Shah",
    excerpt: "A sober framework for sizing a volatile asset without blowing up your plan.",
    tags: ["crypto", "risk", "allocation"],
    lead: "Crypto isn't going away, but neither is its volatility. The grown-up question isn't whether to own it — it's how much.",
    takeaway: "Size any position so a 70% drawdown wouldn't change your life. If it would, you own too much.",
    sections: [
      { h: "A sizing rule", p: ["Treat crypto like a high-risk sleeve, not a core holding."],
        list: ["Most planners suggest 1–5% of investable assets", "Rebalance so winners don't quietly become your whole portfolio", "Never invest the emergency fund"] },
      { h: "Mind the taxes", p: ["Every trade is a taxable event. Track your basis or your gains will surprise you in April."] },
    ],
    conclusion: "Own it deliberately and small. Conviction is fine; concentration is how plans break.",
  }),
  makeArticle({
    slug: "index-funds-vs-etfs-2026-cost-breakdown",
    title: "Index Funds vs ETFs: The 2026 Cost Breakdown",
    category: "Investing", date: "2026-05-28", author: "Maya Torres",
    excerpt: "They look identical from a distance. Up close, taxes and trading mechanics decide the winner.",
    tags: ["index", "etf", "fees"],
    lead: "For most investors, low-cost index funds and ETFs are nearly interchangeable. 'Nearly' is where the money hides.",
    takeaway: "In a taxable account, ETFs usually edge ahead on tax efficiency. In a 401(k), the wrapper barely matters.",
    sections: [
      { h: "Where they differ", p: ["The exposure is the same; the plumbing isn't."],
        list: ["ETFs trade intraday; funds price once a day", "ETFs are typically more tax-efficient in taxable accounts", "Mutual funds allow easy automatic investing"] },
      { h: "The honest answer", p: ["Pick whichever you'll actually contribute to consistently. Behavior beats basis points."] },
    ],
    conclusion: "Costs matter, but consistency matters more. Automate, stay cheap, and ignore the noise.",
  }),
];

export const SITE = {
  name: "Finance Daily",
  lead: "Master your money with",
  accent: "Personal Finance",
  tagline: "Smart, practical money guides — investing, saving, budgeting, and crypto made simple.",
  eyebrow: "Finance · Updated daily",
  nav: ["Investing", "Saving", "Budgeting", "Crypto"],
  defaultTheme: "forest",
  domain: "financedaily.com",
  seedArticles: financeArticles,
};
