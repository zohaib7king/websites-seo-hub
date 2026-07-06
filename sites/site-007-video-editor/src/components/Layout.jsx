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

export default function Layout({ children, title, description, theme = "forge", brand, canonical, fullWidth = false }) {
  const t = getTheme(theme);
  const b = brand || SITE;
  const year = new Date().getFullYear();
  const pageTitle = title ? `${title} | ${b.name}` : `${b.name} — Video Editor`;
  const pageDescription = description || b.tagline;
  const canonicalUrl = canonical || `https://${b.domain || SITE.domain}`;
  const isLight = theme === "forge" || theme === "sandwich";

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
        <meta name="theme-color" content={t.accent} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:${t.bg};--surface:${t.surface};--border:${t.border};
          --accent:${t.accent};--accent2:${t.accent2};--accent3:${t.accent3 || t.accent2};--text:${t.text};--muted:${t.muted};
          --hero:${t.hero};
          --glow:0 18px 45px color-mix(in srgb,${t.accent} 28%,transparent);
          --glow2:0 14px 36px color-mix(in srgb,${t.accent2} 25%,transparent);
          --radius:14px;
          --font:Outfit,Inter,ui-sans-serif,system-ui,sans-serif;
          --serif:"DM Serif Display",Georgia,serif;
          --max:1240px;
        }
        html{scroll-behavior:smooth;}
        html,body{
          background:${t.body};color:var(--text);font-family:var(--font);line-height:1.55;
          min-height:100vh;-webkit-font-smoothing:antialiased;
        }
        a{color:inherit;text-decoration:none;}
        img{max-width:100%;display:block;}
        button,input,textarea,select{font:inherit;}
        ::selection{background:var(--accent);color:#fff;}

        .sw-serif{font-family:var(--serif);font-weight:400;letter-spacing:-0.02em;}
        .sw-headline{font-family:var(--serif);font-weight:400;line-height:1.05;letter-spacing:-0.03em;}
        .grad-text{
          background:var(--hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .grad-shift{
          background-size:200% 200%;
          animation:grad-shift 6s ease infinite;
        }
        @keyframes grad-shift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}

        .if-orb{
          position:fixed;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;
          animation:if-float 8s ease-in-out infinite;
        }
        @keyframes if-float{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(12px,-18px) scale(1.06)}}
        .if-content{position:relative;z-index:1;}

        .if-topbar{
          background:var(--hero);background-size:200% 100%;
          animation:if-bar 10s linear infinite;color:#fff;
        }
        @keyframes if-bar{0%{background-position:0% 50%}100%{background-position:200% 50%}}

        .nav-link{
          color:var(--text);font-size:14px;font-weight:700;padding:8px 12px;border-radius:999px;
          transition:color .2s,background .2s,transform .2s;
        }
        .nav-link:hover{
          color:#fff;
          background:var(--hero);
          transform:translateY(-1px);
        }

        .sw-btn{
          display:inline-flex;align-items:center;justify-content:center;gap:8px;
          font-weight:800;font-size:14px;padding:14px 22px;border-radius:999px;
          border:2px solid transparent;cursor:pointer;
          transition:transform .2s,box-shadow .2s,filter .2s;
        }
        .sw-btn:hover{transform:translateY(-3px) scale(1.02);}
        .sw-btn-primary{background:var(--hero);color:#fff;box-shadow:var(--glow);}
        .sw-btn-primary:hover{filter:brightness(1.08);box-shadow:var(--glow),var(--glow2);}
        .sw-btn-ghost{
          background:color-mix(in srgb,var(--surface) 85%,transparent);
          color:var(--text);border-color:color-mix(in srgb,var(--accent) 40%,var(--border));
        }
        .sw-btn-ghost:hover{border-color:var(--accent2);box-shadow:var(--glow2);}

        .sw-reveal{opacity:0;transform:translateY(36px) scale(.98);transition:opacity .85s cubic-bezier(.22,1,.36,1),transform .85s cubic-bezier(.22,1,.36,1);}
        .sw-reveal--in{opacity:1;transform:none;}

        .sw-reel-section{overflow:hidden;padding:48px 0 56px;}
        .sw-reel-track{display:flex;gap:20px;width:max-content;animation:sw-reel-scroll 40s linear infinite;}
        .sw-reel-section:hover .sw-reel-track{animation-play-state:paused;}
        @keyframes sw-reel-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .sw-reel-link{flex:0 0 320px;text-decoration:none;color:inherit;}
        .sw-reel-card{cursor:pointer;}
        .sw-reel-thumb{
          position:relative;border-radius:var(--radius);overflow:hidden;
          aspect-ratio:16/10;background:var(--border);
          border:2px solid transparent;
          background-clip:padding-box;
          box-shadow:0 8px 30px rgba(0,0,0,.08);
          transition:box-shadow .3s,transform .3s;
        }
        .sw-reel-card:hover .sw-reel-thumb{
          box-shadow:var(--glow),0 16px 40px rgba(0,0,0,.12);
          transform:translateY(-4px);
        }
        .sw-reel-thumb::before{
          content:"";position:absolute;inset:0;border-radius:var(--radius);padding:2px;
          background:var(--hero);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity .3s;
        }
        .sw-reel-card:hover .sw-reel-thumb::before{opacity:1;}
        .sw-reel-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease;}
        .sw-reel-card:hover .sw-reel-thumb img{transform:scale(1.08);}
        .sw-reel-play{
          position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          font-size:16px;color:#fff;opacity:0;transition:opacity .25s;
          background:linear-gradient(135deg,rgba(225,29,143,.45),rgba(14,165,233,.45));
        }
        .sw-reel-card:hover .sw-reel-play{opacity:1;}
        .sw-reel-meta{padding:14px 2px 0;}
        .sw-reel-cat{
          display:block;font-size:11px;font-weight:800;letter-spacing:.08em;
          text-transform:uppercase;color:var(--accent);margin-bottom:4px;
        }
        .sw-reel-meta strong{font-family:var(--serif);font-size:22px;font-weight:400;}

        .sw-thumb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
        .sw-thumb-card{display:block;border-radius:var(--radius);overflow:hidden;transition:transform .25s;}
        .sw-thumb-card:hover{transform:translateY(-6px);}
        .sw-thumb-img{
          aspect-ratio:16/10;overflow:hidden;background:var(--border);
          border-radius:var(--radius);box-shadow:0 10px 28px rgba(0,0,0,.08);
        }
        .sw-thumb-img img{width:100%;height:100%;object-fit:cover;transition:transform .45s;}
        .sw-thumb-card:hover .sw-thumb-img img{transform:scale(1.07);}
        .sw-thumb-cap{padding:14px 0;}
        .sw-thumb-cap span{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--accent2);}
        .sw-thumb-cap strong{display:block;font-family:var(--serif);font-size:20px;margin-top:4px;}

        .sw-team-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;}
        .sw-team-card{text-align:center;transition:transform .3s;}
        .sw-team-card:hover{transform:translateY(-6px);}
        .sw-team-photo{
          width:100%;aspect-ratio:1;border-radius:50%;overflow:hidden;
          margin-bottom:18px;background:var(--border);
          border:3px solid transparent;
          background-image:linear-gradient(var(--surface),var(--surface)),var(--hero);
          background-origin:border-box;background-clip:padding-box,border-box;
          box-shadow:var(--glow);
        }
        .sw-team-photo img{width:100%;height:100%;object-fit:cover;}
        .sw-team-name{font-family:var(--serif);font-size:26px;margin-bottom:4px;}
        .sw-team-role{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:var(--hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .sw-team-bio{font-size:14px;color:var(--muted);line-height:1.7;max-width:280px;margin:0 auto;}

        .sw-scroll-hint{
          display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;
          color:var(--accent);margin-top:32px;
          animation:sw-bounce 2s ease-in-out infinite;
        }
        @keyframes sw-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}

        .if-pill{
          display:inline-flex;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:800;
          background:color-mix(in srgb,var(--accent) 12%,var(--surface));
          border:1px solid color-mix(in srgb,var(--accent) 35%,var(--border));
          color:var(--accent);
          animation:if-pulse 3s ease-in-out infinite;
        }
        @keyframes if-pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 30%,transparent)}50%{box-shadow:0 0 0 8px transparent}}

        .if-section-band{
          background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 8%,var(--surface)),color-mix(in srgb,var(--accent2) 10%,var(--surface)));
          border-top:1px solid color-mix(in srgb,var(--accent) 20%,var(--border));
          border-bottom:1px solid color-mix(in srgb,var(--accent2) 20%,var(--border));
        }

        .card-hover{transition:transform .25s,box-shadow .25s;}
        .card-hover:hover{transform:translateY(-5px);}

        @media(max-width:900px){
          .sw-thumb-grid,.sw-team-grid,.port-grid,.svc-grid,.feature-split{grid-template-columns:1fr !important;}
          .sw-reel-link{flex:0 0 260px;}
          .hide-mobile{display:none !important;}
          .sw-hero-title{font-size:clamp(42px,12vw,72px) !important;}
          main{padding-inline:20px !important;}
          .if-orb{display:none;}
        }
      `}} />

      <div className="if-orb" style={{ width: 300, height: 300, top: "8%", left: "-5%", background: "#ff4d9a", opacity: 0.2 }} />
      <div className="if-orb" style={{ width: 340, height: 340, top: "35%", right: "-8%", background: "#38bdf8", opacity: 0.18, animationDelay: "2s" }} />
      <div className="if-orb" style={{ width: 260, height: 260, bottom: "10%", left: "25%", background: "#a855f7", opacity: 0.15, animationDelay: "4s" }} />

      <div className="if-content">
        <div className="if-topbar">
          <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "9px 24px", fontSize: 12.5, fontWeight: 800, letterSpacing: "0.04em", textAlign: "center" }}>
            ✦ {b.eyebrow} ✦
          </div>
        </div>

        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          borderBottom: `1px solid color-mix(in srgb, var(--accent) 18%, var(--border))`,
          background: isLight ? "color-mix(in srgb, var(--surface) 88%, transparent)" : `color-mix(in srgb, ${t.bg} 78%, transparent)`,
          backdropFilter: "blur(14px)",
        }}>
          <div style={{
            maxWidth: "var(--max)", margin: "0 auto", padding: "0 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center", height: 72,
          }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 38, height: 38, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "var(--hero)", color: "#fff", fontWeight: 900, fontSize: 13, boxShadow: "var(--glow)",
              }}>
                IF
              </span>
              <span className="grad-text grad-shift sw-serif" style={{ fontSize: 22 }}>{b.name}</span>
            </Link>
            <nav className="hide-mobile" style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
          borderTop: `1px solid color-mix(in srgb, var(--accent) 20%, var(--border))`,
          background: "color-mix(in srgb, var(--surface) 95%, var(--accent))",
        }}>
          <div style={{
            maxWidth: "var(--max)", margin: "0 auto", padding: "48px 24px 32px",
            display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between",
          }}>
            <div style={{ maxWidth: 320 }}>
              <div className="grad-text sw-serif" style={{ fontSize: 24, marginBottom: 10 }}>{b.name}</div>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>{b.tagline}</p>
              {b.location && <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 12 }}>{b.location}</p>}
              {b.email && <p style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>{b.email}</p>}
            </div>
            <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 14 }}>Explore</div>
                <Link href="/portfolio" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Work</Link>
                <Link href="/services" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Services</Link>
                <Link href="/about" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>About</Link>
                <Link href="/contact" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Contact</Link>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent2)", marginBottom: 14 }}>Social</div>
                {b.social?.instagram && <a href={b.social.instagram} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Instagram</a>}
                {b.social?.youtube && <a href={b.social.youtube} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 14, marginBottom: 10 }}>YouTube</a>}
                <Link href="/admin" style={{ display: "block", fontSize: 14, marginBottom: 10, color: "var(--muted)" }}>Admin</Link>
              </div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid var(--border)`, padding: "18px 24px", maxWidth: "var(--max)", margin: "0 auto" }}>
            <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.7, marginBottom: 6 }}>{b.footerNote}</p>
            <p style={{ color: "var(--muted)", fontSize: 12 }}>© {year} {b.name}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
