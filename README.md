# tudastars.hu – statikus összefoglaló oldal

A TudásTárs csoport egyoldalas, statikus oldala. A programok egy periódusos rendszer
elemeiként jelennek meg; amelyiknek saját weboldala van (TudásRészecskék, TudásPresszó),
oda visz tovább. Cloudflare Pages szolgálja ki a GitHub-repóból; build-lépés nincs,
a `public/` mappa tartalma megy ki változtatás nélkül.

## Felépítés

```
public/
  index.html            az oldal; minden program leírása a csempéje melletti .el__detail blokkban van
  assets/css/style.css  stílusok (színek: a régi logó pirosa #B92432 és grafitja #26252B)
  assets/js/main.js     mobilmenü, a programtáblázat kiolvasója és szűrője
  assets/img/           képek WebP-ben (a GitHub Actions hozza át őket, lásd lent)
  assets/fonts/         Archivo és Source Serif 4 (saját tárhelyen, magyar karakterkészletre szűkítve)
  favicon.svg
  _headers              Cloudflare Pages fejlécek (noindex a teszt idejére, gyorsítótárazás)
scripts/kepek.txt       a régi oldalról átemelendő képek listája
.github/workflows/kepek.yml
```

## Új program felvétele

1. Másolj le egy `<li class="cell">` blokkot az `index.html`-ben, és írd át a csempét és a leírást.
2. A `data-cat` értéke: `kids`, `public`, `training` vagy `research`.
3. A rácsbeli helyét a `grid-area` adja; új hely esetén a `style.css` `grid-template-areas` részét is bővíteni kell.

## Képek

A `scripts/kepek.txt` minden sora: `név  forrás-URL`. Ha a fájl változik és a `main` ágra kerül,
a GitHub Actions letölti a képeket, 1600 px-re kicsinyíti, WebP-be alakítja, és visszacommitolja
a `public/assets/img/` mappába.

## Cloudflare Pages beállítás

- Production branch: `main`
- Build command: *(üres)*
- Build output directory: `public`

## Élesítés előtt

- A `noindex` (HTML meta és `_headers`) törlendő.
- A domain DNS-ét át kell vinni a Cloudflare-re, figyelve a levelezés (MX, SPF) rekordjaira.

## Helyi előnézet

```
cd public && python3 -m http.server 8000
```
