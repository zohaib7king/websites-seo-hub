import Head from "next/head";
import Link from "next/link";
import { getTheme } from "../themes";
import { SITE } from "../site.config";

const mainNav = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Hire me", href: "/contact", primary: true },
];

export default function Layout({ children, title, description, theme = "cinema", brand, canonical }) {
  const t = getTheme(theme);
  const b = brand || SITE;
  const year = new Date().getFullYear();
  const pageTitle = title ? `${title} | ${b.name}` : `${b.name} — Freelance Video Editor`;
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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content={t.accent} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:${t.bg};--surface:${t.surface};--border:${t.border};
          --accent:${t.accent};--accent2:${t.accent2};--text:${t.text};--muted:${t.muted};
          --hero:${t.hero};
          --glow:0 20px 50px color-mix(in srgb,${t.accent} 35%,transparent);
          --glow2:0 16px 40px color-mix(in srgb,${t.accent2} 28%,transparent);
          --radius:20px;
          --font:Outfit,Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
          --max:1180px;
        }
        html{scroll-behavior:smooth;}
        html,body{
          background:${t.body};color:var(--text);font-family:var(--font);line-height:1.6;
          min-height:100vh;-webkit-font-smoothing:antialiased;
        }
        a{color:inherit;text-decoration:none;}
        img{max-width:100%;display:block;}
        button,input,textarea,select{font:inherit;}
        ::selection{background:var(--accent);color:#fff;}

        .ff-topbar{
          background:linear-gradient(90deg,#ff4d9a,#a855f7,#38bdf8,#34d399,#fbbf24,#ff4d9a);
          background-size:200% 100%;
          animation:ff-shift 8s linear infinite;
          color:#fff;
        }
        @keyframes ff-shift{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes ff-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes ff-pulse{0%,100%{opacity:.55}50%{opacity:.9}}

        .nav-link{
          color:var(--muted);font-size:14px;font-weight:700;padding:8px 12px;border-radius:999px;
          transition:color .15s,background .15s,transform .15s;
        }
        .nav-link:hover{
          color:#fff;
          background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 35%,transparent),color-mix(in srgb,var(--accent2) 30%,transparent));
          transform:translateY(-1px);
        }
        .ff-btn{
          display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;
          font-weight:800;font-size:14px;padding:13px 20px;border:1px solid transparent;cursor:pointer;
          transition:transform .15s,box-shadow .15s,filter .15s;
        }
        .ff-btn:hover{transform:translateY(-2px) scale(1.02);}
        .ff-btn-primary{
          background:var(--hero);color:#fff;box-shadow:var(--glow);
        }
        .ff-btn-primary:hover{filter:brightness(1.08);box-shadow:var(--glow),var(--glow2);}
        .ff-btn-soft{
          background:color-mix(in srgb,var(--surface) 70%,transparent);
          color:var(--text);border-color:color-mix(in srgb,var(--accent) 40%,var(--border));
          backdrop-filter:blur(10px);
        }
        .ff-btn-soft:hover{border-color:var(--accent2);box-shadow:var(--glow2);}

        .glass-panel{
          background:linear-gradient(145deg,color-mix(in srgb,var(--surface) 88%,#fff),color-mix(in srgb,var(--surface) 92%,var(--accent)));
          border:1px solid color-mix(in srgb,var(--accent) 28%,var(--border));
          box-shadow:0 28px 80px rgba(0,0,0,.35),inset 0 1px 0 color-mix(in srgb,#fff 12%,transparent);
          backdrop-filter:blur(16px);
        }
        .card-hover{transition:border-color .2s,transform .2s,box-shadow .2s;}
        .card-hover:hover{
          border-color:transparent !important;
          transform:translateY(-5px) scale(1.01);
          box-shadow:0 22px 50px rgba(0,0,0,.28),0 0 0 1px color-mix(in srgb,var(--accent) 50%,transparent),var(--glow2);
        }
        .play-badge{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
        .play-badge span{
          width:58px;height:58px;border-radius:999px;
          background:var(--hero);border:2px solid rgba(255,255,255,.35);
          display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;
          box-shadow:var(--glow);transition:transform .2s;
        }
        .card-hover:hover .play-badge span{transform:scale(1.1);}

        .ff-logo-mark{
          background:var(--hero);box-shadow:var(--glow);
        }
        .ff-logo-text{
          background:var(--hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .ff-section-label{
          display:inline-flex;align-items:center;gap:8px;
          font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;
          background:var(--hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .ff-orb{
          position:fixed;border-radius:50%;filter:blur(60px);pointer-events:none;z-index:0;
          animation:ff-pulse 6s ease-in-out infinite;
        }
        .ff-content{position:relative;z-index:1;}
        .ff-stat{
          background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 18%,var(--surface)),var(--surface));
          border:1px solid color-mix(in srgb,var(--accent2) 35%,var(--border));
          border-radius:18px;padding:14px 16px;text-align:center;
        }

        @media(max-width:880px){
          .hero-split,.feature-split,.svc-grid,.port-grid,.stats-row{grid-template-columns:1fr !important;}
          .hide-mobile{display:none !important;}
          .hero-title{font-size:34px !important;}
          main{padding-inline:18px !important;}
          .ff-orb{display:none;}
        }
      `}} />

      <div className="ff-orb" style={{ width: 280, height: 280, top: "12%", left: "-4%", background: "#ff4d9a", opacity: 0.22 }} />
      <div className="ff-orb" style={{ width: 320, height: 320, top: "40%", right: "-6%", background: "#38bdf8", opacity: 0.18, animationDelay: "1.5s" }} />
      <div className="ff-orb" style={{ width: 240, height: 240, bottom: "8%", left: "30%", background: "#a855f7", opacity: 0.16, animationDelay: "3s" }} />

      <div className="ff-content">
        <div className="ff-topbar">
          <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "8px 24px", fontSize: 12.5, fontWeight: 800, letterSpacing: "0.02em", textAlign: "center" }}>
            ✦ {b.eyebrow} ✦
          </div>
        </div>

        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          borderBottom: "1px solid color-mix(in srgb, var(--accent) 22%, var(--border))",
          background: "color-mix(in srgb, var(--bg) 78%, transparent)",
          backdropFilter: "blur(16px)",
        }}>
          <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 70 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="ff-logo-mark" style={{ width: 40, height: 40, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14 }}>
                FF
              </span>
              <span className="ff-logo-text" style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.03em" }}>{b.name}</span>
            </Link>
            <nav className="hide-mobile" style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={item.primary ? "ff-btn ff-btn-primary" : "nav-link"}
                  style={item.primary ? { padding: "10px 16px", fontSize: 13 } : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "36px 24px 72px" }}>
          {children}
        </main>

        <footer style={{
          borderTop: "1px solid color-mix(in srgb, var(--accent) 25%, var(--border))",
          background: "linear-gradient(180deg, color-mix(in srgb, var(--surface) 90%, var(--accent)), var(--bg))",
        }}>
          <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "40px 24px 28px", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between" }}>
            <div style={{ maxWidth: 360 }}>
              <div className="ff-logo-text" style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>{b.name}</div>
              <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>{b.tagline}</p>
            </div>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent2)", marginBottom: 12 }}>Explore</div>
                <Link href="/portfolio" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Portfolio</Link>
                <Link href="/services" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Services</Link>
                <Link href="/contact" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Hire me</Link>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>Company</div>
                <Link href="/about" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>About</Link>
                <Link href="/contact" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Contact</Link>
                <Link href="/privacy" style={{ display: "block", fontSize: 13, marginBottom: 8 }}>Privacy</Link>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", maxWidth: "var(--max)", margin: "0 auto" }}>
            <p style={{ color: "var(--muted)", fontSize: 11.5, lineHeight: 1.7, marginBottom: 8 }}>{b.footerNote}</p>
            <p style={{ color: "var(--muted)", fontSize: 12.5, textAlign: "center" }}>© {year} {b.name}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
