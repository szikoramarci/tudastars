// Cloudflare Pages Functions middleware: PIN-kódos belépés a bemutató oldal elé.
//
// A látogató egy egyszerű oldalon beírja a kódot; helyes kód után 30 napig
// egy süti emlékszik rá. A kód linkben is küldhető: https://.../?pin=1234
//
// Beállítás (Cloudflare Pages > Settings > Variables and Secrets, titkosítva):
//   DEMO_PIN     – a belépőkód (pl. 4 számjegy)
//   DEMO_SECRET  – hosszú véletlen szöveg a süti aláírásához
// Ha valamelyik hiányzik, az oldal NEM nyílik meg (zárt alapállapot).
// A kód cseréjekor minden korábbi belépés érvényét veszti.
//
// Minden válaszra X-Robots-Tag: noindex, nofollow fejléc kerül.

const ROBOTS = "noindex, nofollow";
const SUTI = "belepes";
const NAPOK = 30;

const encoder = new TextEncoder();

async function hmacHex(secret, text) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(text)));
  return [...sig].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Időzítés-független összehasonlítás (mindkét értéket hash-eljük, így azonos a hosszuk).
async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]).then((x) => x.map((buf) => new Uint8Array(buf)));
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

// Csak saját oldalon belüli visszairányítás (nincs nyitott átirányítás).
function safeTarget(value) {
  const s = String(value || "/");
  return s.startsWith("/") && !s.startsWith("//") && !s.includes("\\") ? s : "/";
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function pinPage(target, wrong) {
  const body = `<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Belépés – TudásTárs tervváltozatok</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px 16px;
         background: #26252b; color: #26252b; font: 1.0625rem/1.55 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
  main { width: 100%; max-width: 24rem; background: #fff; border-radius: 12px; padding: 2rem 1.5rem 1.75rem; }
  .jel { display: inline-grid; place-items: center; width: 2.2rem; height: 2.2rem; border-radius: 5px; background: #b92432; color: #fff; font-weight: 700; margin-bottom: 1rem; }
  h1 { font-size: 1.5rem; line-height: 1.15; margin: 0 0 .5rem; }
  p { margin: 0 0 1.25rem; color: #5c5a64; }
  label { display: block; font-weight: 600; margin-bottom: .4rem; }
  input { width: 100%; font: 700 1.9rem/1 ui-monospace, "SF Mono", Menlo, Consolas, monospace; letter-spacing: .4em; text-align: center;
          padding: .7rem .5rem; border: 2px solid #8b8994; border-radius: 8px; color: #26252b; }
  input:focus { outline: 3px solid #b92432; outline-offset: 2px; border-color: #26252b; }
  button { width: 100%; margin-top: 1rem; min-height: 50px; border: 0; border-radius: 8px; background: #b92432; color: #fff; font-family: inherit; font-size: 1.1rem; font-weight: 650; cursor: pointer; }
  button:hover { background: #931b27; }
  button:focus-visible { outline: 3px solid #26252b; outline-offset: 3px; }
  .hiba { color: #931b27; font-weight: 600; margin: .75rem 0 0; }
  .apro { font-size: .9rem; margin: 1.25rem 0 0; }
  .apro a { color: #931b27; }
</style>
</head>
<body>
<main>
  <div class="jel" aria-hidden="true">Tt</div>
  <h1>TudásTárs – tervváltozatok</h1>
  <p>Ez az oldal a TudásTárs számára készült. A megnyitásához írja be a kapott kódot.</p>
  <form method="post" action="/belepes">
    <input type="hidden" name="cel" value="${escapeHtml(target)}">
    <label for="pin">Belépőkód</label>
    <input id="pin" name="pin" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" maxlength="8" required autofocus${wrong ? ' aria-describedby="hiba" aria-invalid="true"' : ""}>
    ${wrong ? '<p class="hiba" id="hiba" role="alert">Ez a kód nem jó. Kérjük, próbálja újra.</p>' : ""}
    <button type="submit">Belépés</button>
  </form>
  <p class="apro">Nincs meg a kód? Írjon: <a href="mailto:info@webness.hu">info@webness.hu</a></p>
</main>
</body>
</html>`;
  return new Response(body, {
    status: 401,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": ROBOTS,
    },
  });
}

function plain(status, text) {
  return new Response(text, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": ROBOTS },
  });
}

export async function onRequest({ request, env, next }) {
  const pin = env.DEMO_PIN;
  const secret = env.DEMO_SECRET;
  if (!pin || !secret) return plain(503, "A bemutató oldal még nincs beállítva.");

  const expected = await hmacHex(secret, `belepes:${pin}`);
  const url = new URL(request.url);

  // 1. Érvényes süti: mehet tovább.
  const cookie = readCookie(request, SUTI);
  if (cookie && (await safeEqual(cookie, expected))) {
    if (url.pathname === "/belepes") return Response.redirect(new URL("/", url), 303);
    const response = await next();
    const res = new Response(response.body, response);
    res.headers.set("X-Robots-Tag", ROBOTS);
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }

  // 2. Beküldött kód: űrlapból (POST /belepes) vagy linkből (?pin=).
  let given = null;
  let target = "/";
  if (request.method === "POST" && url.pathname === "/belepes") {
    const form = await request.formData();
    given = String(form.get("pin") || "").replace(/\s+/g, "");
    target = safeTarget(form.get("cel"));
  } else if (url.searchParams.has("pin")) {
    given = String(url.searchParams.get("pin") || "").replace(/\s+/g, "");
    url.searchParams.delete("pin");
    target = safeTarget(url.pathname + url.search);
  }

  if (given !== null) {
    if (given && (await safeEqual(given, pin))) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: target,
          "Set-Cookie": `${SUTI}=${expected}; Path=/; Max-Age=${NAPOK * 86400}; HttpOnly; Secure; SameSite=Lax`,
          "Cache-Control": "no-store",
          "X-Robots-Tag": ROBOTS,
        },
      });
    }
    // Rossz kód: kis késleltetés a próbálgatás ellen.
    await new Promise((r) => setTimeout(r, 800));
    return pinPage(target, true);
  }

  // 3. Nincs belépve: a kódkérő oldal.
  return pinPage(safeTarget(url.pathname + url.search), false);
}
