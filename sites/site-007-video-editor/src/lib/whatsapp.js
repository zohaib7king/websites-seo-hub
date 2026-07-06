export function whatsappLink(url, message) {
  if (!url) return null;
  try {
    let href = url.trim();
    if (!href.startsWith("http")) {
      const digits = href.replace(/\D/g, "");
      if (!digits) return null;
      href = `https://wa.me/${digits}`;
    }
    const u = new URL(href);
    if (message) u.searchParams.set("text", message);
    return u.toString();
  } catch {
    return url;
  }
}
