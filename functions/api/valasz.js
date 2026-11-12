// A választó oldal „Mi tetszik?” kérdéseinek fogadása.
// A válaszok a VALASZOK nevű Workers KV-tárba kerülnek (Cloudflare: Storage & Databases > KV),
// egy bejegyzés = egy beküldés. A belépés (PIN) a _middleware.js-ben van, ide csak belépve lehet eljutni.

const MAX = 2000; // egy szöveges mező legfeljebb ennyi karakter

const ROVID = (v) => String(v || "").trim().slice(0, MAX);

const VALTOZATOK = new Set(["1", "2", "3", "elozo", "egyik-sem"]);

export async function onRequestPost({ request, env }) {
  if (!env.VALASZOK) {
    return new Response("A válaszok mentése most nem működik. Kérjük, írjon az info@webness.hu címre.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const form = await request.formData();
  const valtozat = ROVID(form.get("valtozat"));
  const valasz = {
    ido: new Date().toISOString(),
    valtozat: VALTOZATOK.has(valtozat) ? valtozat : "",
    tetszik: form.getAll("tetszik").map(ROVID).slice(0, 12),
    mas: ROVID(form.get("mas")),
    maskepp: ROVID(form.get("maskepp")),
    nev: ROVID(form.get("nev")).slice(0, 120),
  };

  const kulcs = `valasz:${valasz.ido}:${crypto.randomUUID().slice(0, 8)}`;
  await env.VALASZOK.put(kulcs, JSON.stringify(valasz), {
    metadata: { valtozat: valasz.valtozat, nev: valasz.nev },
  });

  return new Response(null, { status: 303, headers: { Location: "/koszonom/", "Cache-Control": "no-store" } });
}
