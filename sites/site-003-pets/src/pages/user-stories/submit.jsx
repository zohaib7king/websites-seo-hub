import Layout from "../../components/Layout.jsx";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getSite } from "../../lib/data";
import { authHeaders, getAuth, requireLogin } from "../../lib/authClient";
import { SITE } from "../../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "petportal" } };
}

const PET_TYPES = ["Dog", "Cat", "Parrot", "Bird", "Rabbit", "Rooster", "Other"];

export default function SubmitUserStory({ theme }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [petType, setPetType] = useState("Dog");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const check = () => {
      const auth = getAuth();
      setAuthed(Boolean(auth?.token));
      if (!auth?.token) requireLogin();
    };
    check();
    window.addEventListener("pets-auth-changed", check);
    return () => window.removeEventListener("pets-auth-changed", check);
  }, []);

  const submit = async () => {
    if (!getAuth()?.token) { requireLogin(); return; }
    if (!title.trim() || !content.trim()) {
      setError("Title and story content are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user-pet-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ title, content, pet_type: petType, image_url: imageUrl || null }),
      });
      const payload = await res.json();
      if (res.status === 401) { requireLogin(); return; }
      if (!res.ok) throw new Error(payload.error || "Could not publish story");
      router.push(`/user-stories/${payload.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Share Your Pet Story" theme={theme}>
      <section style={{ maxWidth: 640, margin: "0 auto" }}>
        <span style={{ color: "#22c55e", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>Community</span>
        <h1 style={{ fontSize: 36, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 10px" }}>Share your pet story</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.75, marginBottom: 24 }}>
          Tell us about your pet — their personality, funny moments, or how they changed your life. Add a photo URL to make it special.
        </p>

        {!authed ? (
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
            <p style={{ color: "var(--muted)", marginBottom: 16 }}>Please login or sign up to share your pet story.</p>
            <button type="button" onClick={requireLogin} className="pet-btn pet-btn-primary">Login / Sign Up</button>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 22, padding: 28, display: "grid", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 6 }}>Story Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="My cat learned to open doors..." style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", font: "inherit" }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 6 }}>Pet Type</label>
              <select value={petType} onChange={e => setPetType(e.target.value)} style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", font: "inherit" }}>
                {PET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 6 }}>Photo URL (optional)</label>
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/my-pet.jpg" style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", font: "inherit" }} />
              {imageUrl && <img src={imageUrl} alt="Preview" style={{ marginTop: 10, width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12 }} onError={e => { e.target.style.display = "none"; }} />}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, display: "block", marginBottom: 6 }}>Your Story</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Tell us about your pet..." rows={8} style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", font: "inherit", resize: "vertical" }} />
            </div>
            {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" onClick={submit} disabled={loading} className="pet-btn pet-btn-primary">
                {loading ? "Publishing..." : "Publish Story"}
              </button>
              <Link href="/user-stories" className="pet-btn pet-btn-soft">Cancel</Link>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
