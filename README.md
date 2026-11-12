# tudastars.hu – tervváltozatok

A TudásTárs csoport új, statikus oldalának tervváltozatai, egy választó oldalról elérve.
Cloudflare Pages szolgálja ki a GitHub-repóból; build-lépés nincs, a `public/` mappa tartalma
megy ki változtatás nélkül. Az egész oldalt egy belépőkód (PIN) védi (lásd lent).

## Felépítés

```
public/
  index.html            választó oldal: változatok és a „Mi tetszik?” kérdések
  koszonom/             a kérdések beküldése utáni oldal
  valtozat-1/           1. Periódusos rendszer – JavaScript nélkül, CSS-es kiválasztással
  valtozat-2/           2. Kockás füzet – piros margó, időrendi munkák
  valtozat-3/           3. Két ajtó – sötét, fotós, közönség szerint kettéosztva
  jelenlegi/            az előző kör változata (saját betűk + JS: assets/css, assets/js, assets/fonts)
  assets/img/           közös képek WebP-ben (a nagyok mellett -800 méretű változat is)
  reteg/                értékesítési réteg minden oldalon: lebegő fülek a jobb szélen,
                        „Ki készítette?” és „Vélemények” ablak (reteg.html tartalom, reteg.js, reteg.css)
  favicon.svg
  robots.txt            Disallow: /
  _headers              X-Robots-Tag: noindex, nofollow
functions/_middleware.js  PIN-kódos belépés az egész oldal előtt (30 napos süti)
functions/api/valasz.js   a „Mi tetszik?” válaszok mentése Workers KV-ba
scripts/kepek.txt         a régi oldalról átemelendő képek listája
.github/workflows/kepek.yml
```

A `valtozat-1..3` a `gyorsweb` repó demószabályai szerint készült: egy HTML és egy CSS
változatonként, rendszerbetűk, JavaScript nélkül (csak a különálló réteg használ egy kis JS-t), mobilon fix Hívás/Email sáv,
Lighthouse mobil (helyben mérve): teljesítmény, akadálymentesség és jó gyakorlatok 100.

## Belépés (PIN)

A `functions/_middleware.js` egy egyszerű kódkérő oldalt mutat. Helyes kód után egy aláírt,
HttpOnly süti 30 napig emlékszik a belépésre. A kód linkben is küldhető: `/?pin=1234`.
Beállítás a Cloudflare Pages projektben (titkosítva, production és preview):

- `DEMO_PIN` – a belépőkód
- `DEMO_SECRET` – hosszú véletlen szöveg a süti aláírásához

Ha valamelyik hiányzik, az oldal 503-at ad. A kód cseréjekor minden korábbi belépés megszűnik.
Rossz kódnál 0,8 mp késleltetés lassítja a próbálgatást. Élesítéskor a middleware törlendő.

## Válaszok

A választó oldal kérdéseire adott válaszok a `tudastars-valaszok` Workers KV-tárba kerülnek
(kötés neve: `VALASZOK`), egy beküldés egy bejegyzés (`valasz:<időpont>:<azonosító>`, JSON).
Megnézhetők a Cloudflare felületén: Storage & Databases > KV > tudastars-valaszok.

## Helyi teszt

```
npx wrangler pages dev public --kv VALASZOK --binding DEMO_PIN=1234 --binding DEMO_SECRET=teszt
```

## Képek

A `scripts/kepek.txt` minden sora: `név  forrás-URL`. Ha a fájl változik és a `main` ágra kerül,
a GitHub Actions letölti a képeket, 1600 px-re kicsinyíti, WebP-be alakítja, és visszacommitolja
a `public/assets/img/` mappába.

## Cloudflare Pages beállítás

- Production branch: `main`
- Build command: *(üres)*
- Build output directory: `public`

## Élesítés előtt

- A kiválasztott változat kerül a gyökérbe; a többi, a választó, a `koszonom/`, a `reteg/` és a `functions/` törlendő,
  és az oldalból a `reteg.css` / `reteg.js` hivatkozás.
- A `noindex, nofollow` (HTML meta, `_headers`, `robots.txt`) törlendő.
- Az „egyeztetendő” HTML-kommentek és az adatkezelési tájékoztató helye kitöltendő.
- A domain DNS-ét át kell vinni a Cloudflare-re, figyelve a levelezés (MX, SPF) rekordjaira.

## Helyi előnézet

```
cd public && python3 -m http.server 8000
```
