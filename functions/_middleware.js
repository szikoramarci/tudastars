// Cloudflare Pages Functions middleware: HTTP Basic Auth a bemutató oldal elé.
//
// Beállítás (Cloudflare Pages > Settings > Environment variables, titkosítva):
//   DEMO_USER  – felhasználónév
//   DEMO_PASS  – jelszó
// Ha valamelyik hiányzik, az oldal NEM nyílik meg (zárt alapállapot).
//
// Minden válaszra X-Robots-Tag: noindex, nofollow fejléc kerül.

const ROBOTS = "noindex, nofollow";
const REALM = "Bemutato oldal";

const encoder = new TextEncoder();

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

// Időzítés-független összehasonlítás: mindkét értéket hash-eljük, így azonos a hosszuk.
async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  if (crypto.subtle.timingSafeEqual) return crypto.subtle.timingSafeEqual(ha, hb);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

function decodeBasic(header) {
  const match = /^Basic\s+([A-Za-z0-9+/=]+)\s*$/i.exec(header || "");
  if (!match) return null;
  try {
    const bytes = Uint8Array.from(atob(match[1]), (c) => c.charCodeAt(0));
    const text = new TextDecoder().decode(bytes); // UTF-8 (ékezetes jelszó is működik)
    const i = text.indexOf(":");
    if (i < 0) return null;
    return { user: text.slice(0, i), pass: text.slice(i + 1) };
  } catch {
    return null;
  }
}

function plain(status, body, extra = {}) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": ROBOTS,
      ...extra,
    },
  });
}

export async function onRequest({ request, env, next }) {
  const expectedUser = env.DEMO_USER;
  const expectedPass = env.DEMO_PASS;

  if (!expectedUser || !expectedPass) {
    return plain(503, "A bemutató oldal még nincs beállítva.");
  }

  const creds = decodeBasic(request.headers.get("Authorization"));
  if (creds) {
    const [okUser, okPass] = await Promise.all([
      safeEqual(creds.user, expectedUser),
      safeEqual(creds.pass, expectedPass),
    ]);
    if (okUser && okPass) {
      const response = await next();
      const res = new Response(response.body, response);
      res.headers.set("X-Robots-Tag", ROBOTS);
      res.headers.set("Cache-Control", "private, no-store");
      return res;
    }
  }

  return plain(401, "Ez egy jelszóval védett bemutató oldal.", {
    "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
  });
}
