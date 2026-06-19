import Head from "next/head";
import Link from "next/link";
import { getTheme } from "../themes";
import { catSlug } from "../lib/data";
import { SITE } from "../site.config";

export default function Layout({ children, title, description, theme = "midnight" }) {
  const t = getTheme(theme);
  const year = new Date().getFullYear();
  return (
    <>
      <Head>
        <title>{title ? `${title} | ${SITE.name}` : SITE.name}</title>
        <meta name="description" content={description || SITE.tagline} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* AdSense — replace with your publisher ID */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossOrigin="anonymous"></script> */}
      </Head>

      {/* Theme applied as CSS variables so the whole page recolors per site.
          Includes the design-system tokens (--radius/--grad-accent/--glow/--font)
          so @zoyzoy/ui components render on-brand per theme. */}
      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:${t.bg};--surface:${t.surface};--border:${t.border};
          --accent:${t.accent};--accent2:${t.accent2};--text:${t.text};--muted:${t.muted};
          --hero:${t.hero};--grad-accent:${t.hero};--glow:0 10px 30px color-mix(in srgb,${t.accent} 28%,transparent);
          --radius:12px;--font:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;--max:1140px;
        }
        html{scroll-behavior:smooth;}
        html,body{background:${t.body};color:var(--text);font-family:var(--font);line-height:1.6;min-height:100vh;-webkit-font-smoothing:antialiased;}
        body{background-attachment:fixed;}
        a{color:inherit;text-decoration:none;}
        ::selection{background:var(--accent);color:#fff;}
        .nav-link{color:var(--muted);font-size:14px;font-weight:600;transition:color .15s;}
        .nav-link:hover{color:var(--text);}
        .ad-slot{background:color-mix(in srgb,var(--surface) 70%,transparent);border:1px dashed var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:12px;letter-spacing:.04em;}
        @media(max-width:768px){
          .article-grid{grid-template-columns:1fr !important;}
          .hide-mobile{display:none !important;}
          .hero-title{font-size:32px !important;}
        }
      `}} />

      {/* Header — sticky, blurred */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--surface) 80%, transparent)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      }}>
        <div style={{ height: 3, background: "var(--hero)" }} />
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 66 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--hero)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, boxShadow: "var(--glow)" }}>
              {SITE.name.charAt(0)}
            </span>
            <span style={{ fontWeight: 800, fontSize: 19, background: "var(--hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {SITE.name}
            </span>
          </Link>
          <nav className="hide-mobile" style={{ display: "flex", gap: 26, alignItems: "center" }}>
            {SITE.nav.map(cat => (
              <Link key={cat} href={`/category/${catSlug(cat)}`} className="nav-link">{cat}</Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Top ad banner */}
      <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "16px 24px 0" }}>
        {/* AdSense unit goes here */}
        <div className="ad-slot" style={{ height: 90 }}>[ Advertisement ]</div>
      </div>

      <main style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "36px 24px 56px" }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "40px 24px 28px", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between" }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ fontWeight: 800, fontSize: 17, background: "var(--hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 8 }}>
              {SITE.name}
            </div>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>{SITE.tagline}</p>
          </div>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Sections</div>
              {SITE.nav.map(cat => (
                <Link key={cat} href={`/category/${catSlug(cat)}`} style={{ display: "block", color: "var(--text)", fontSize: 13, marginBottom: 8 }}>{cat}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Company</div>
              <Link href="/privacy" style={{ display: "block", color: "var(--text)", fontSize: 13, marginBottom: 8 }}>Privacy</Link>
              <Link href="/contact" style={{ display: "block", color: "var(--text)", fontSize: 13, marginBottom: 8 }}>Contact</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", textAlign: "center", color: "var(--muted)", fontSize: 12.5 }}>
          © {year} {SITE.name}. All rights reserved.
        </div>
      </footer>
    </>
  );
}
