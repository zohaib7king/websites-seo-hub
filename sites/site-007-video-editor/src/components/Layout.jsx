import Head from "next/head";
import Link from "next/link";
import { getTheme } from "../themes";
import { SITE } from "../site.config";

const mainNav = [
  { label: "Home", href: "/" },
  { label: "My Work", href: "/portfolio" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Layout({ children, title, description, theme = "pro", brand, canonical, fullWidth = false }) {
  const t = getTheme(theme);
  const b = brand || SITE;
  const year = new Date().getFullYear();
  const pageTitle = title ? `${title} | ${b.name}` : `${b.name} — Video Editor`;
  const pageDescription = description || b.tagline;
  const canonicalUrl = canonical || `https://${b.domain || SITE.domain}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={b.name} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="theme-color" content={t.accent} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:${t.bg};--surface:${t.surface};--border:${t.border};
          --accent:${t.accent};--accent2:${t.accent2};--text:${t.text};--muted:${t.muted};
          --hero:${t.hero};
          --shadow:0 8px 30px rgba(15,23,42,.06);
          --radius:10px;
          --font:Inter,ui-sans-serif,system-ui,sans-serif;
          --max:1180px;
        }
        html{scroll-behavior:smooth;}
        html,body{background:${t.body};color:var(--text);font-family:var(--font);line-height:1.6;min-height:100vh;}
        a{color:inherit;text-decoration:none;}
        img{max-width:100%;display:block;}
        button,input,textarea,select{font:inherit;}
        ::selection{background:var(--accent);color:#fff;}

        .pro-accent{background:var(--hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .pro-eyebrow{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);}

        .nav-link{color:var(--text);font-size:14px;font-weight:600;padding:8px 12px;border-radius:8px;transition:background .2s,color .2s;}
        .nav-link:hover{background:color-mix(in srgb,var(--accent) 10%,transparent);color:var(--accent);}

        .sw-btn{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:14px;padding:12px 22px;border-radius:8px;border:2px solid transparent;cursor:pointer;transition:transform .2s,box-shadow .2s;}
        .sw-btn:hover{transform:translateY(-2px);}
        .sw-btn-primary{background:var(--hero);color:#fff;box-shadow:var(--shadow);}
        .sw-btn-ghost{background:var(--surface);color:var(--accent);border-color:color-mix(in srgb,var(--accent) 35%,var(--border));}

        .sw-reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease;}
        .sw-reveal--in{opacity:1;transform:none;}

        .sw-reel-section{overflow:hidden;padding:40px 0 48px;}
        .sw-reel-track{display:flex;gap:18px;width:max-content;animation:sw-reel-scroll 50s linear infinite;}
        .sw-reel-section:hover .sw-reel-track{animation-play-state:paused;}
        @keyframes sw-reel-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .sw-reel-link{flex:0 0 300px;}
        .sw-reel-thumb{border-radius:var(--radius);overflow:hidden;aspect-ratio:16/10;background:var(--border);box-shadow:var(--shadow);border:1px solid var(--border);}
        .sw-reel-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .45s;}
        .sw-reel-card:hover .sw-reel-thumb img{transform:scale(1.04);}
        .sw-reel-meta{padding:12px 2px 0;}
        .sw-reel-cat{display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent2);margin-bottom:4px;}
        .sw-reel-meta strong{font-size:17px;font-weight:700;}

        .sw-thumb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .sw-thumb-card{border-radius:var(--radius);overflow:hidden;background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow);}
        .sw-thumb-img{aspect-ratio:16/10;overflow:hidden;}
        .sw-thumb-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
        .sw-thumb-card:hover .sw-thumb-img img{transform:scale(1.04);}
        .sw-thumb-cap{padding:14px 16px 16px;}
        .sw-thumb-cap span{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);}
        .sw-thumb-cap strong{display:block;font-size:16px;font-weight:700;margin-top:4px;}

        .sw-team-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
        .sw-team-card{text-align:center;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px 16px;box-shadow:var(--shadow);transition:transform .25s;}
        .sw-team-card:hover{transform:translateY(-4px);}
        .sw-team-photo{width:120px;height:120px;border-radius:50%;overflow:hidden;margin:0 auto 14px;border:3px solid color-mix(in srgb,var(--accent) 25%,var(--border));}
        .sw-team-photo img{width:100%;height:100%;object-fit:cover;}
        .sw-team-name{font-size:20px;font-weight:700;margin-bottom:4px;}
        .sw-team-role{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--accent2);margin-bottom:8px;}
        .sw-team-bio{font-size:14px;color:var(--muted);line-height:1.65;}

        .pro-section{padding:72px 24px;}
        .pro-band{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
        .card-hover{transition:transform .25s,box-shadow .25s;}
        .card-hover:hover{transform:translateY(-3px);}

        @media(max-width:900px){
          .sw-thumb-grid,.sw-team-grid,.port-grid,.svc-grid,.feature-split,.hero-grid{grid-template-columns:1fr !important;}
          .sw-reel-link{flex:0 0 240px;}
          .hide-mobile{display:none !important;}
        }
      `}} />

      <div className="pro-topbar" style={{ background: "var(--hero)", color: "#fff", fontSize: 12.5, fontWeight: 600, textAlign: "center", padding: "8px 16px" }}>
        {b.eyebrow}
      </div>

      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--surface) 92%, transparent)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 68 }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 20, color: "var(--accent)" }}>{b.name}</Link>
          <nav className="hide-mobile" style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>
            ))}
            <Link href="/contact" className="sw-btn sw-btn-primary" style={{ marginLeft: 8, padding: "10px 16px", fontSize: 13 }}>
              Get in touch
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: fullWidth ? "none" : "var(--max)", margin: "0 auto", padding: fullWidth ? 0 : "0 24px 72px" }}>
        {children}
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "40px 24px", display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between" }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: "var(--accent)", marginBottom: 8 }}>{b.name}</div>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>{b.tagline}</p>
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            <div>
              <div className="pro-eyebrow" style={{ marginBottom: 12 }}>Pages</div>
              {mainNav.map((item) => (
                <Link key={item.href} href={item.href} style={{ display: "block", fontSize: 14, marginBottom: 8 }}>{item.label}</Link>
              ))}
            </div>
            <div>
              <div className="pro-eyebrow" style={{ marginBottom: 12 }}>Social</div>
              {b.social?.instagram && <a href={b.social.instagram} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 14, marginBottom: 8 }}>Instagram</a>}
              {b.social?.youtube && <a href={b.social.youtube} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 14, marginBottom: 8 }}>YouTube</a>}
              <Link href="/admin" style={{ display: "block", fontSize: 14, color: "var(--muted)" }}>Admin</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", maxWidth: "var(--max)", margin: "0 auto" }}>
          <p style={{ color: "var(--muted)", fontSize: 12 }}>© {year} {b.name}. {b.footerNote}</p>
        </div>
      </footer>
    </>
  );
}
