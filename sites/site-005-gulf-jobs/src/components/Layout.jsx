import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTheme } from "../themes";
import { catSlug } from "../lib/data";
import { clearAuth, getAuth, saveAuth } from "../lib/authClient";
import { SITE } from "../site.config";

const mainNav = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "CV Maker", href: "/cv-maker" },
  { label: "Articles", href: "/articles" },
  { label: "Contact Us", href: "/contact" },
];

function LoginModal({ open, onClose }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Login failed");
      saveAuth(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-print" style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,23,42,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 30px 90px rgba(15,23,42,.28)" }}>
        <button type="button" onClick={onClose} style={{ float: "right", border: "1px solid var(--border)", background: "#fff", borderRadius: 999, width: 32, height: 32, cursor: "pointer", color: "var(--muted)", fontWeight: 900 }}>x</button>
        <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>
          {mode === "login" ? "Login" : "Sign up"}
        </span>
        <h2 style={{ fontSize: 28, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 10px" }}>
          {mode === "login" ? "Login to like articles" : "Create your free account"}
        </h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 16 }}>
          You need an account before liking articles or downloading gated CV templates.
        </p>
        <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
          <input value={email} onChange={event => setEmail(event.target.value)} placeholder="Email address" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", font: "inherit" }} />
          <input value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" type="password" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", font: "inherit" }} />
        </div>
        {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" onClick={submit} disabled={loading} className="career-btn career-btn-primary">
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
          <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="career-btn career-btn-soft">
            {mode === "login" ? "Create account" : "Already have account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children, title, description, theme = "midnight", canonical, image, schema }) {
  const t = getTheme(theme);
  const year = new Date().getFullYear();
  const [auth, setAuth] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const pageTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} - Gulf Jobs, CV Maker and Career Guides`;
  const pageDescription = description || SITE.tagline;
  const canonicalUrl = canonical || `https://${SITE.domain}`;
  const socialImage = image?.startsWith("http") ? image : image ? `https://${SITE.domain}${image}` : null;
  const defaultSchema = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: `https://${SITE.domain}`,
      description: SITE.tagline,
      potentialAction: {
        "@type": "SearchAction",
        target: `https://${SITE.domain}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.name,
      url: `https://${SITE.domain}`,
      description: SITE.tagline,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Editorial corrections",
        email: `hello@${SITE.domain}`,
      },
    },
  ];

  useEffect(() => {
    const refresh = () => setAuth(getAuth());
    const openLogin = () => setLoginOpen(true);
    refresh();
    window.addEventListener("gulf-auth-changed", refresh);
    window.addEventListener("gulf-auth-required", openLogin);
    return () => {
      window.removeEventListener("gulf-auth-changed", refresh);
      window.removeEventListener("gulf-auth-required", openLogin);
    };
  }, []);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE.name} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {socialImage && <meta property="og:image" content={socialImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="theme-color" content={t.accent} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema || defaultSchema) }}
        />
        {/* AdSense — replace with your publisher ID */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossOrigin="anonymous"></script> */}
      </Head>

      {/* Theme applied as CSS variables (recolors per site) + design-system tokens. */}
      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:${t.bg};--surface:${t.surface};--border:${t.border};
          --accent:${t.accent};--accent2:${t.accent2};--text:${t.text};--muted:${t.muted};
          --hero:${t.hero};--grad-accent:${t.hero};--glow:0 18px 45px color-mix(in srgb,${t.accent} 22%,transparent);
          --radius:18px;--font:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;--max:1180px;
        }
        html{scroll-behavior:smooth;}
        html,body{background:${t.body};color:var(--text);font-family:var(--font);line-height:1.6;min-height:100vh;-webkit-font-smoothing:antialiased;}
        body{background-attachment:fixed;}
        a{color:inherit;text-decoration:none;}
        img,svg,video,canvas{max-width:100%;}
        button,input,textarea,select{max-width:100%;}
        ::selection{background:var(--accent);color:#fff;}
        .nav-link{color:var(--muted);font-size:14px;font-weight:700;transition:color .15s,background .15s;padding:8px 10px;border-radius:999px;}
        .nav-link:hover{color:var(--accent);background:color-mix(in srgb,var(--accent) 9%,transparent);}
        .ad-slot{background:color-mix(in srgb,var(--accent) 5%,#fff);border:1px dashed var(--border);border-radius:16px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:12px;letter-spacing:.04em;}
        .card-hover{transition:border-color .2s,transform .2s,box-shadow .2s;}
        .card-hover:hover{border-color:color-mix(in srgb,var(--accent) 40%,var(--border)) !important;transform:translateY(-3px);box-shadow:0 18px 40px rgba(91,33,182,.11);}
        .career-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;font-weight:800;font-size:14px;padding:12px 18px;border:1px solid transparent;cursor:pointer;}
        .career-btn-primary{background:var(--hero);color:#fff;box-shadow:var(--glow);}
        .career-btn-soft{background:#fff;color:var(--accent);border-color:var(--border);}
        .glass-panel{background:rgba(255,255,255,.82);border:1px solid rgba(226,232,240,.9);box-shadow:0 24px 70px rgba(79,70,229,.10);backdrop-filter:blur(14px);}
        @media(max-width:880px){
          .news-grid{grid-template-columns:1fr !important;}
          .hero-portal{grid-template-columns:1fr !important;padding:34px 22px !important;}
          .stats-grid{grid-template-columns:1fr !important;}
          .feature-split{grid-template-columns:1fr !important;}
          .hide-mobile{display:none !important;}
          .hero-title{font-size:30px !important;}
          main{padding-inline:18px !important;}
        }
        @media print{
          header,.top-strip,.site-newsletter,footer,.ad-slot,.no-print{display:none !important;}
          main{max-width:none !important;padding:0 !important;}
          body{background:#fff !important;}
        }
      `}} />

      {/* Top strip */}
      <div className="top-strip" style={{ background: "linear-gradient(90deg,#4c1d95,#7c3aed,#0ea5e9)", color: "#fff" }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "6px 24px", display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 12 }}>
          <span style={{ color: "#fff", fontWeight: 700 }}>{SITE.eyebrow}</span>
          <span className="hide-mobile" style={{ color: "rgba(255,255,255,.88)" }}>Free CV maker and practical Gulf job search guides</span>
        </div>
      </div>

      {/* Header — sticky, blurred */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(226,232,240,.85)",
        background: "rgba(255,255,255,.86)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 66 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 36, height: 36, borderRadius: 12, background: "var(--hero)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 15, boxShadow: "var(--glow)" }}>
              GJ
            </span>
            <span style={{ fontWeight: 900, fontSize: 20, color: "var(--text)", letterSpacing: "-0.03em" }}>
              {SITE.name}
            </span>
          </Link>
          <nav className="hide-mobile" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {mainNav.map(item => (
              <Link key={item.href} href={item.href} className={item.href === "/cv-maker" ? "career-btn career-btn-primary" : "nav-link"} style={item.href === "/cv-maker" ? { padding: "9px 15px", fontSize: 13 } : undefined}>{item.label}</Link>
            ))}
            {auth?.user ? (
              <button type="button" onClick={clearAuth} className="nav-link" style={{ border: "none", background: "transparent", cursor: "pointer" }}>Logout</button>
            ) : (
              <button type="button" onClick={() => setLoginOpen(true)} className="nav-link" style={{ border: "none", background: "transparent", cursor: "pointer" }}>Login</button>
            )}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "34px 24px 64px" }}>
        {children}
      </main>

      {/* Newsletter band */}
      <div id="newsletter" className="site-newsletter" style={{ background: "linear-gradient(135deg,#4c1d95 0%,#7c3aed 55%,#0ea5e9 100%)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 24px", textAlign: "center" }}>
          <h3 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: "#fff", letterSpacing: "-0.03em" }}>Get Gulf career tips in your inbox</h3>
          <p style={{ color: "rgba(255,255,255,.85)", fontSize: 15, marginBottom: 20 }}>{SITE.tagline}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <input className="zz-input" placeholder="you@email.com" style={{ background: "#fff", border: "1px solid rgba(255,255,255,.35)", borderRadius: 999, padding: "12px 18px", color: "var(--text)", fontSize: 14, minWidth: 280 }} />
            <button className="career-btn" style={{ background: "#111827", color: "#fff", border: "none" }}>Subscribe</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "#fff" }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "40px 24px 28px", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between" }}>
          <div style={{ maxWidth: 340 }}>
            <div style={{ fontWeight: 900, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>
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
              <Link href="/about" style={{ display: "block", color: "var(--text)", fontSize: 13, marginBottom: 8 }}>About Us</Link>
              <Link href="/articles" style={{ display: "block", color: "var(--text)", fontSize: 13, marginBottom: 8 }}>Articles</Link>
              <Link href="/privacy" style={{ display: "block", color: "var(--text)", fontSize: 13, marginBottom: 8 }}>Privacy</Link>
              <Link href="/contact" style={{ display: "block", color: "var(--text)", fontSize: 13, marginBottom: 8 }}>Contact Us</Link>
              <Link href="/cv-maker" style={{ display: "block", color: "var(--text)", fontSize: 13, marginBottom: 8 }}>CV Maker</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", maxWidth: "var(--max)", margin: "0 auto" }}>
          <p style={{ color: "var(--muted)", fontSize: 11.5, lineHeight: 1.7, marginBottom: 8 }}>
            Disclaimer: The content on {SITE.name} is for general informational and educational purposes only and does
            not constitute professional advice. Always do your own research before acting on anything you read here.
          </p>
          <p style={{ color: "var(--muted)", fontSize: 12.5, textAlign: "center" }}>© {year} {SITE.name}. All rights reserved.</p>
        </div>
      </footer>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
