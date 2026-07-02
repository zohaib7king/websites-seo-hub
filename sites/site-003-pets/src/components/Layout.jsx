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
  { label: "Articles", href: "/articles" },
  { label: "Stories", href: "/stories" },
  { label: "User Pet Stories", href: "/user-stories" },
  { label: "Contact Us", href: "/contact" },
];

function LoginModal({ open, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

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
      if (!res.ok) throw new Error(payload.error || "Authentication failed");
      saveAuth(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,23,42,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 30px 90px rgba(249,115,22,.25)" }}>
        <button type="button" onClick={onClose} style={{ float: "right", border: "1px solid var(--border)", background: "#fff", borderRadius: 999, width: 32, height: 32, cursor: "pointer", fontWeight: 900 }}>×</button>
        <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>
          {mode === "login" ? "Login" : "Sign Up"}
        </span>
        <h2 style={{ fontSize: 28, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 10px" }}>
          {mode === "login" ? "Welcome back, pet lover!" : "Join the pet community"}
        </h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 16 }}>
          Login to like articles and stories, and share your own pet stories with photos.
        </p>
        <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", font: "inherit" }} />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (6+ characters)" type="password" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", font: "inherit" }} />
        </div>
        {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={submit} disabled={loading} className="pet-btn pet-btn-primary">
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
          <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="pet-btn pet-btn-soft">
            {mode === "login" ? "Create account" : "Already have account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children, title, description, theme = "sunset", canonical, schema }) {
  const t = getTheme(theme);
  const year = new Date().getFullYear();
  const [auth, setAuth] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState("login");
  const pageTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} — Pet Care, Stories & Community`;
  const pageDescription = description || SITE.tagline;
  const canonicalUrl = canonical || `https://${SITE.domain}`;

  useEffect(() => {
    const refresh = () => setAuth(getAuth());
    const openLogin = () => { setLoginMode("login"); setLoginOpen(true); };
    refresh();
    window.addEventListener("pets-auth-changed", refresh);
    window.addEventListener("pets-auth-required", openLogin);
    return () => {
      window.removeEventListener("pets-auth-changed", refresh);
      window.removeEventListener("pets-auth-required", openLogin);
    };
  }, []);

  const openSignup = () => { setLoginMode("signup"); setLoginOpen(true); };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="theme-color" content={t.accent} />
        {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:${t.bg};--surface:${t.surface};--border:${t.border};
          --accent:${t.accent};--accent2:${t.accent2};--text:${t.text};--muted:${t.muted};
          --hero:${t.hero};--glow:0 18px 45px color-mix(in srgb,${t.accent} 22%,transparent);
          --radius:18px;--font:Inter,ui-sans-serif,system-ui,sans-serif;--max:1180px;
        }
        html{scroll-behavior:smooth;}
        html,body{color:var(--text);font-family:var(--font);line-height:1.6;min-height:100vh;-webkit-font-smoothing:antialiased;}
        body{
          background:linear-gradient(160deg,#fff7ed 0%,#fef3c7 20%,#fce7f3 45%,#e0f2fe 70%,#f0fdf4 100%);
          background-attachment:fixed;
        }
        a{color:inherit;text-decoration:none;}
        .nav-link{color:var(--muted);font-size:14px;font-weight:700;transition:color .15s,background .15s;padding:8px 10px;border-radius:999px;}
        .nav-link:hover{color:var(--accent);background:color-mix(in srgb,var(--accent) 9%,transparent);}
        .pet-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;font-weight:800;font-size:14px;padding:12px 18px;border:1px solid transparent;cursor:pointer;}
        .pet-btn-primary{background:var(--hero);color:#fff;box-shadow:var(--glow);}
        .pet-btn-soft{background:#fff;color:var(--accent);border-color:var(--border);}
        .card-hover{transition:border-color .2s,transform .2s,box-shadow .2s;}
        .card-hover:hover{border-color:color-mix(in srgb,var(--accent) 40%,var(--border)) !important;transform:translateY(-3px);box-shadow:0 18px 40px rgba(249,115,22,.12);}
        .glass-panel{background:rgba(255,255,255,.88);border:1px solid rgba(255,255,255,.6);box-shadow:0 24px 70px rgba(249,115,22,.10);backdrop-filter:blur(14px);}
        @media(max-width:960px){
          .hide-mobile{display:none !important;}
          .hero-title{font-size:30px !important;}
          main{padding-inline:18px !important;}
          .banner-grid{grid-template-columns:repeat(3,1fr) !important;}
        }
        @media(max-width:600px){
          .banner-grid{grid-template-columns:repeat(2,1fr) !important;}
        }
      `}} />

      {/* Colorful top strip */}
      <div style={{ background: "linear-gradient(90deg,#f97316,#fb7185,#a855f7,#38bdf8,#22c55e,#f59e0b)", color: "#fff" }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "7px 24px", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ fontWeight: 800 }}>🐾 {SITE.eyebrow}</span>
          <span className="hide-mobile" style={{ opacity: .92 }}>Love every pet — dogs, cats, birds & more</span>
        </div>
      </div>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(251,113,133,.2)",
        background: "rgba(255,255,255,.9)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ height: 4, background: "linear-gradient(90deg,#f97316,#fb7185,#a855f7,#38bdf8,#22c55e)" }} />
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 66, gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--hero)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, boxShadow: "var(--glow)" }}>🐾</span>
            <span style={{ fontWeight: 900, fontSize: 19, letterSpacing: "-0.03em", background: "var(--hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{SITE.name}</span>
          </Link>
          <nav className="hide-mobile" style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {mainNav.map(item => (
              <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>
            ))}
            {auth?.user ? (
              <>
                <Link href="/user-stories/submit" className="pet-btn pet-btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>Share Story</Link>
                <button type="button" onClick={clearAuth} className="nav-link" style={{ border: "none", background: "transparent", cursor: "pointer" }}>Logout</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => { setLoginMode("login"); setLoginOpen(true); }} className="nav-link" style={{ border: "none", background: "transparent", cursor: "pointer" }}>Login</button>
                <button type="button" onClick={openSignup} className="pet-btn pet-btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>Sign Up</button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "28px 24px 56px" }}>
        {children}
      </main>

      {/* Newsletter */}
      <div style={{ background: "linear-gradient(135deg,#f97316 0%,#fb7185 40%,#a855f7 100%)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 24px", textAlign: "center" }}>
          <h3 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: "#fff" }}>🐾 Get pet tips in your inbox</h3>
          <p style={{ color: "rgba(255,255,255,.88)", fontSize: 15, marginBottom: 20 }}>{SITE.tagline}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <input placeholder="you@email.com" style={{ background: "#fff", border: "none", borderRadius: 999, padding: "12px 18px", fontSize: 14, minWidth: 260 }} />
            <button className="pet-btn" style={{ background: "#111827", color: "#fff" }}>Subscribe</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "#fff" }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "40px 24px 28px", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between" }}>
          <div style={{ maxWidth: 340 }}>
            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>🐾 {SITE.name}</div>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>{SITE.tagline}</p>
          </div>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Explore</div>
              {mainNav.map(item => (
                <Link key={item.href} href={item.href} style={{ display: "block", color: "var(--text)", fontSize: 13, marginBottom: 8 }}>{item.label}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Categories</div>
              {(SITE.articleCategories || []).slice(0, 6).map(cat => (
                <Link key={cat} href={`/category/${catSlug(cat)}`} style={{ display: "block", color: "var(--text)", fontSize: 13, marginBottom: 8 }}>{cat}</Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", maxWidth: "var(--max)", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "var(--muted)", fontSize: 12 }}>© {year} {SITE.name}. All rights reserved.</p>
        </div>
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} initialMode={loginMode} />
    </>
  );
}
