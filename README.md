# tudastars.hu – tervváltozatok

A TudásTárs csoport új, statikus oldalának tervváltozatai, egy választó oldalról elérve.
Cloudflare Pages szolgálja ki a GitHub-repóból; build-lépés nincs, a `public/` mappa tartalma
megy ki változtatás nélkül. Az egész oldalt jelszó védi (lásd lent).

## Felépítés

```
public/
  index.html            választó oldal (előnézeti képek: valaszto/)
  valtozat-1/           1. Periódusos rendszer – JavaScript nélkül, CSS-es kiválasztással
  valtozat-2/           2. Kockás füzet – piros margó, időrendi munkák
  valtozat-3/           3. Két ajtó – sötét, fotós, közönség szerint kettéosztva
  jelenlegi/            az előző kör változata (saját betűk + JS: assets/css, assets/js, assets/fonts)
  assets/img/           közös képek WebP-ben (a nagyok mellett -800 méretű változat is)
  favicon.svg
  robots.txt            Disallow: /
  _headers              X-Robots-Tag: noindex, nofollow
functions/_middleware.js  HTTP Basic Auth az egész oldal előtt (gyorsweb-minta)
scripts/kepek.txt         a régi oldalról átemelendő képek listája
.github/workflows/kepek.yml
```

A `valtozat-1..3` a `gyorsweb` repó demószabályai szerint készült: egy HTML és egy CSS
változatonként, rendszerbetűk, JavaScript nélkül, mobilon fix Hívás/Email sáv,
Lighthouse mobil (helyben mérve): teljesítmény, akadálymentesség és jó gyakorlatok 100.

## Jelszavas védelem

A `functions/_middleware.js` a Cloudflare Pages `DEMO_USER` és `DEMO_PASS` környezeti
változóival dolgozik (titkosítva, production és preview). Ha valamelyik hiányzik, az oldal
503-at ad. Élesítéskor a middleware törlendő.

## Képek

A `scripts/kepek.txt` minden sora: `név  forrás-URL`. Ha a fájl változik és a `main` ágra kerül,
a GitHub Actions letölti a képeket, 1600 px-re kicsinyíti, WebP-be alakítja, és visszacommitolja
a `public/assets/img/` mappába.

## Cloudflare Pages beállítás

- Production branch: `main`
- Build command: *(üres)*
- Build output directory: `public`

## Élesítés előtt

- A kiválasztott változat kerül a gyökérbe; a többi, a választó és a `functions/` törlendő.
- A `noindex, nofollow` (HTML meta, `_headers`, `robots.txt`) törlendő.
- Az ügyfél írásban jóváhagyja a fotók és a teljes tartalom felhasználását.
- Az „egyeztetendő” HTML-kommentek és az adatkezelési tájékoztató helye kitöltendő.
- A domain DNS-ét át kell vinni a Cloudflare-re, figyelve a levelezés (MX, SPF) rekordjaira.

## Helyi előnézet

```
cd public && python3 -m http.server 8000
```
