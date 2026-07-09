import Link from "next/link";

export default function Logo({ name = "ibtihajForage", href = "/", size = "md", showText = true, className = "" }) {
  const icon = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  const textSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;
  const split = String(name).match(/^(.+?)(Forage)$/i);

  const inner = (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: size === "sm" ? 8 : 10 }}>
      <img src="/logo-icon.svg" alt="" width={icon} height={icon} style={{ display: "block", flexShrink: 0 }} />
      {showText && (
        <span style={{ fontWeight: 800, fontSize: textSize, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {split ? (
            <>
              <span className="pro-accent" style={{ background: "var(--hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {split[1]}
              </span>
              <span style={{ color: "var(--text)" }}>{split[2]}</span>
            </>
          ) : (
            <span className="pro-accent" style={{ background: "var(--hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {name}
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label={name} style={{ textDecoration: "none", color: "inherit" }}>
        {inner}
      </Link>
    );
  }
  return inner;
}
