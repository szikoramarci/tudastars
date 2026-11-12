// A „Tetszik ez a rész?” jelzések fogadása (public/reteg/tetszik.js).
// Egy jelzés = egy KV-bejegyzés a VALASZOK tárban: `jelzes:<időpont>:<azonosító>`.
// A belépés (PIN) a _middleware.js-ben van, ide csak belépve lehet eljutni.

const TIPUSOK = new Set(["tetszik", "visszavonta", "miert", "maskepp", "zaro", "hivas"]);
const szoveg = (v, max) => String(v ?? "").trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  if (!env.VALASZOK) return new Response(null, { status: 503 });

  let be;
  try {
    be = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const tipus = szoveg(be.tipus, 20);
  if (!TIPUSOK.has(tipus)) return new Response(null, { status: 400 });

  const jelzes = {
    ido: new Date().toISOString(),
    tipus,
    oldal: szoveg(be.oldal, 100),
    resz: szoveg(be.resz, 120),
    okok: Array.isArray(be.okok) ? be.okok.slice(0, 8).map((o) => szoveg(o, 60)) : [],
    sajat: szoveg(be.sajat, 200),
    szoveg: szoveg(be.szoveg, 1000),
    valasz: szoveg(be.valasz, 20),
    telefon: szoveg(be.telefon, 40),
    idopont: szoveg(be.idopont, 40),
  };
  for (const k of Object.keys(jelzes)) if (jelzes[k] === "" || (Array.isArray(jelzes[k]) && !jelzes[k].length)) delete jelzes[k];

  await env.VALASZOK.put(`jelzes:${jelzes.ido}:${crypto.randomUUID().slice(0, 8)}`, JSON.stringify(jelzes), {
    metadata: { tipus, oldal: jelzes.oldal || "", resz: jelzes.resz || "" },
  });
  return new Response(null, { status: 204 });
}
