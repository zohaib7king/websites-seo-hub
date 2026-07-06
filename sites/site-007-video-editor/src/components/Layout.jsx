import Head from "next/head";
import Link from "next/link";
import { getTheme } from "../themes";
import { SITE } from "../site.config";

const mainNav = [
  { label: "Work", href: "/portfolio" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Layout({ children, title, description, theme = "sandwich", brand, canonical, fullWidth = false }) {
  const t = getTheme(theme);
  const b = brand || SITE;
  const year = new Date().getFullYear();
  const pageTitle = title ? `${title} | ${b.name}` : `${b.name} — Video Editor`;
  const pageDescription = description || b.tagline;
  const canonicalUrl = canonical || `https://${b.domain || SITE.domain}`;
  const isSandwich = theme === "sandwich";

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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content={t.bg} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:${t.bg};--surface:${t.surface};--border:${t.border};
          --accent:${t.accent};--accent2:${t.accent2};--text:${t.text};--muted:${t.muted};
          --hero:${t.hero};
          --radius:4px;
          --font:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
          --serif:"DM Serif Display",Georgia,"Times New Roman",serif;
          --max:1240px;
        }
        html{scroll-behavior:smooth;}
        html,body{
          background:var(--bg);color:var(--text);font-family:var(--font);line-height:1.55;
          min-height:100vh;-webkit-font-smoothing:antialiased;
        }
        a{color:inherit;text-decoration:none;}
        img{max-width:100%;display:block;}
        button,input,textarea,select{font:inherit;}
        ::selection{background:var(--accent);color:var(--bg);}

        .sw-serif{font-family:var(--serif);font-weight:400;letter-spacing:-0.02em;}
        .sw-headline{font-family:var(--serif);font-weight:400;line-height:1.05;letter-spacing:-0.03em;}

        .nav-link{
          color:var(--text);font-size:14px;font-weight:600;padding:8px 0;
          position:relative;transition:opacity .2s;
        }
        .nav-link:hover{opacity:.55;}
        .nav-link::after{
          content:"";position:absolute;left:0;bottom:4px;width:0;height:1px;
          background:var(--text);transition:width .25s ease;
        }
        .nav-link:hover::after{width:100%;}

        .sw-btn{
          display:inline-flex;align-items:center;justify-content:center;gap:8px;
          font-weight:700;font-size:14px;padding:14px 22px;border-radius:999px;
          border:1.5px solid var(--accent);cursor:pointer;
          transition:transform .2s,background .2s,color .2s;
        }
        .sw-btn:hover{transform:translateY(-2px);}
        .sw-btn-primary{background:var(--accent);color:var(--bg);border-color:var(--accent);}
        .sw-btn-primary:hover{background:transparent;color:var(--accent);}
        .sw-btn-ghost{background:transparent;color:var(--accent);}
        .sw-btn-ghost:hover{background:var(--accent);color:var(--bg);}

        .sw-reveal{opacity:0;transform:translateY(32px);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1);}
        .sw-reveal--in{opacity:1;transform:none;}

        .sw-reel-section{overflow:hidden;padding:48px 0 56px;}
        .sw-reel-track{
          display:flex;gap:20px;width:max-content;
          animation:sw-reel-scroll 45s linear infinite;
        }
        .sw-reel-section:hover .sw-reel-track{animation-play-state:paused;}
        @keyframes sw-reel-scroll{
          0%{transform:translateX(0);}
          100%{transform:translateX(-50%);}
        }
        .sw-reel-link{flex:0 0 320px;text-decoration:none;color:inherit;}
        .sw-reel-card{cursor:pointer;}
        .sw-reel-thumb{
          position:relative;border-radius:6px;overflow:hidden;
          aspect-ratio:16/10;background:var(--border);
        }
        .sw-reel-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease;}
        .sw-reel-card:hover .sw-reel-thumb img{transform:scale(1.06);}
        .sw-reel-play{
          position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          font-size:14px;color:#fff;opacity:0;transition:opacity .25s;
          background:rgba(0,0,0,.35);
        }
        .sw-reel-card:hover .sw-reel-play{opacity:1;}
        .sw-reel-meta{padding:14px 2px 0;}
        .sw-reel-cat{
          display:block;font-size:11px;font-weight:700;letter-spacing:.08em;
          text-transform:uppercase;color:var(--muted);margin-bottom:4px;
        }
        .sw-reel-meta strong{font-family:var(--serif);font-size:22px;font-weight:400;}

        .sw-thumb-grid{
          display:grid;grid-template-columns:repeat(3,1fr);gap:20px;
        }
        .sw-thumb-card{display:block;border-radius:6px;overflow:hidden;}
        .sw-thumb-img{aspect-ratio:16/10;overflow:hidden;background:var(--border);}
        .sw-thumb-img img{width:100%;height:100%;object-fit:cover;transition:transform .45s;}
        .sw-thumb-card:hover .sw-thumb-img img{transform:scale(1.05);}
        .sw-thumb-cap{padding:14px 0;}
        .sw-thumb-cap span{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);}
        .sw-thumb-cap strong{display:block;font-family:var(--serif);font-size:20px;margin-top:4px;}

        .sw-team-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;}
        .sw-team-card{text-align:center;}
        .sw-team-photo{
          width:100%;aspect-ratio:1;border-radius:50%;overflow:hidden;
          margin-bottom:18px;background:var(--border);
        }
        .sw-team-photo img{width:100%;height:100%;object-fit:cover;}
        .sw-team-name{font-family:var(--serif);font-size:26px;margin-bottom:4px;}
        .sw-team-role{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--accent2);margin-bottom:10px;}
        .sw-team-bio{font-size:14px;color:var(--muted);line-height:1.7;max-width:280px;margin:0 auto;}

        .sw-scroll-hint{
          display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;
          color:var(--muted);margin-top:32px;
          animation:sw-bounce 2s ease-in-out infinite;
        }
        @keyframes sw-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}

        .card-hover{transition:transform .25s;}
        .card-hover:hover{transform:translateY(-4px);}

        .ff-btn{display:inline-flex;align-items:center;gap:8px;border-radius:999px;font-weight:700;font-size:14px;padding:13px 20px;border:1.5px solid var(--accent);cursor:pointer;transition:transform .15s,background .15s,color .15s;}
        .ff-btn:hover{transform:translateY(-2px);}
        .ff-btn-primary{background:var(--accent);color:var(--bg);border-color:var(--accent);}
        .ff-btn-soft{background:transparent;color:var(--accent);}

        @media(max-width:900px){
          .sw-thumb-grid,.sw-team-grid{grid-template-columns:1fr !important;}
          .sw-reel-link{flex:0 0 260px;}
          .hide-mobile{display:none !important;}
          .sw-hero-title{font-size:clamp(42px,12vw,72px) !important;}
          main{padding-inline:20px !important;}
        }
      `}} />

      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: `1px solid ${isSandwich ? "rgba(17,17,17,.08)" : t.border}`,
        background: isSandwich ? "rgba(244,239,230,.92)" : `color-mix(in srgb, ${t.bg} 78%, transparent)`,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: "var(--max)", margin: "0 auto", padding: "0 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center", height: 72,
        }}>
          <Link href="/" className="sw-serif" style={{ fontSize: 22, fontWeight: 400 }}>
            {b.name}
          </Link>
          <nav className="hide-mobile" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>
            ))}
            <Link href="/contact" className="sw-btn sw-btn-primary" style={{ padding: "10px 18px", fontSize: 13 }}>
              Get in touch
            </Link>
          </nav>
        </div>
      </header>

      <main style={{
        maxWidth: fullWidth ? "none" : "var(--max)",
        margin: "0 auto",
        padding: fullWidth ? "0" : "0 24px 80px",
      }}>
        {children}
      </main>

      <footer style={{
        borderTop: `1px solid ${isSandwich ? "rgba(17,17,17,.1)" : t.border}`,
        background: isSandwich ? t.surface : t.bg,
      }}>
        <div style={{
          maxWidth: "var(--max)", margin: "0 auto", padding: "48px 24px 32px",
          display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between",
        }}>
          <div style={{ maxWidth: 320 }}>
            <div className="sw-serif" style={{ fontSize: 24, marginBottom: 10 }}>{b.name}</div>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>{b.tagline}</p>
            {b.location && <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 12 }}>{b.location}</p>}
            {b.email && <p style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{b.email}</p>}
          </div>
          <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Explore</div>
              <Link href="/portfolio" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Work</Link>
              <Link href="/services" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Services</Link>
              <Link href="/about" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>About</Link>
              <Link href="/contact" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Contact</Link>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Social</div>
              {b.social?.instagram && <a href={b.social.instagram} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Instagram</a>}
              {b.social?.youtube && <a href={b.social.youtube} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>YouTube</a>}
              <Link href="/admin" style={{ display: "block", fontSize: 14, marginBottom: 10, color: "var(--muted)" }}>Admin</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${isSandwich ? "rgba(17,17,17,.08)" : t.border}`, padding: "18px 24px", maxWidth: "var(--max)", margin: "0 auto" }}>
          <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.7, marginBottom: 6 }}>{b.footerNote}</p>
          <p style={{ color: "var(--muted)", fontSize: 12 }}>© {year} {b.name}. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
