import Head from "next/head";
import Link from "next/link";
import { getTheme } from "../themes";
import { SITE } from "../site.config";

const mainNav = [
  { label: "Home", href: "/" },
  { label: "Demo", href: "/demo" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Photo Remake", href: "/photo-remake", primary: true },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export default function Layout({ children, title, description, theme = "sunset", canonical }) {
  const t = getTheme(theme);
  const year = new Date().getFullYear();
  const pageTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} — Childhood Photo Remake`;
  const pageDescription = description || SITE.tagline;
  const canonicalUrl = canonical || `https://${SITE.domain}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE.name} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content={t.accent} />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:${t.bg};--surface:${t.surface};--border:${t.border};
          --accent:${t.accent};--accent2:${t.accent2};--text:${t.text};--muted:${t.muted};
          --hero:${t.hero};--glow:0 18px 45px color-mix(in srgb,${t.accent} 22%,transparent);
          --radius:18px;--font:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;--max:1180px;
        }
        html{scroll-behavior:smooth;}
        html,body{background:${t.body};color:var(--text);font-family:var(--font);line-height:1.6;min-height:100vh;-webkit-font-smoothing:antialiased;}
        a{color:inherit;text-decoration:none;}
        img{max-width:100%;display:block;}
        button,input,textarea,select{font:inherit;}
        ::selection{background:var(--accent);color:#fff;}
        .nav-link{color:var(--muted);font-size:14px;font-weight:700;padding:8px 10px;border-radius:999px;transition:color .15s,background .15s;}
        .nav-link:hover{color:var(--accent);background:color-mix(in srgb,var(--accent) 9%,transparent);}
        .memory-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;font-weight:800;font-size:14px;padding:12px 18px;border:1px solid transparent;cursor:pointer;}
        .memory-btn-primary{background:var(--hero);color:#fff;box-shadow:var(--glow);}
        .memory-btn-soft{background:color-mix(in srgb,var(--surface) 88%,#fff);color:var(--text);border-color:var(--border);}
        .glass-panel{background:color-mix(in srgb,var(--surface) 92%,#fff);border:1px solid var(--border);box-shadow:0 24px 70px rgba(0,0,0,.18);backdrop-filter:blur(14px);}
        .card-hover{transition:border-color .2s,transform .2s,box-shadow .2s;}
        .card-hover:hover{border-color:color-mix(in srgb,var(--accent) 40%,var(--border)) !important;transform:translateY(-3px);box-shadow:0 18px 40px rgba(0,0,0,.12);}
        .before-shot{filter:sepia(.35) contrast(.95) brightness(.92);}
        @media(max-width:880px){
          .hero-split,.compare-grid,.feature-split,.step-grid{grid-template-columns:1fr !important;}
          .hide-mobile{display:none !important;}
          .hero-title{font-size:32px !important;}
          main{padding-inline:18px !important;}
        }
      `}} />

      <div style={{ background: "linear-gradient(90deg,#7c2d12,#ea580c,#fb7185)", color: "#fff" }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "6px 24px", fontSize: 12, fontWeight: 700 }}>
          {SITE.eyebrow}
        </div>
      </div>

      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--surface) 86%, transparent)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 66 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 36, height: 36, borderRadius: 12, background: "var(--hero)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14, boxShadow: "var(--glow)" }}>
              RM
            </span>
            <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.03em" }}>{SITE.name}</span>
          </Link>
          <nav className="hide-mobile" style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {mainNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={item.primary ? "memory-btn memory-btn-primary" : "nav-link"}
                style={item.primary ? { padding: "9px 15px", fontSize: 13 } : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "34px 24px 64px" }}>
        {children}
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "40px 24px 28px", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between" }}>
          <div style={{ maxWidth: 360 }}>
            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>{SITE.name}</div>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>{SITE.tagline}</p>
          </div>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Explore</div>
              <Link href="/demo" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Demo Gallery</Link>
              <Link href="/how-it-works" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>How It Works</Link>
              <Link href="/photo-remake" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Photo Remake Tool</Link>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Company</div>
              <Link href="/about" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>About Us</Link>
              <Link href="/contact" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Contact Us</Link>
              <Link href="/privacy" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Privacy</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", maxWidth: "var(--max)", margin: "0 auto" }}>
          <p style={{ color: "var(--muted)", fontSize: 11.5, lineHeight: 1.7, marginBottom: 8 }}>
            Upload only photos you own or have permission to use. AI remakes are for personal and family keepsakes.
          </p>
          <p style={{ color: "var(--muted)", fontSize: 12.5, textAlign: "center" }}>© {year} {SITE.name}. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
