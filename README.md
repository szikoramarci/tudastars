# tudastars.hu – statikus főoldal (teszt)

A tudastars.hu új, statikus főoldalának próbaverziója. Cloudflare Pages szolgálja ki
a GitHub-repóból; build-lépés nincs, a `public/` mappa tartalma megy ki változtatás nélkül.

## Felépítés

```
public/
  index.html            főoldal
  assets/css/style.css  stílusok
  assets/js/main.js     mobilmenü, a programtáblázat kiolvasója és szűrője
  assets/fonts/         Archivo és Source Serif 4 (saját tárhelyen, magyar karakterkészletre szűkítve)
  favicon.svg
  _headers              Cloudflare Pages fejlécek (noindex a teszt idejére, gyorsítótárazás)
```

## Cloudflare Pages beállítás

- Production branch: `main`
- Build command: *(üres)*
- Build output directory: `public`

## Tudnivalók a tesztről

- A képek egyelőre a régi szerverről töltődnek (`https://tudastars.hu/wp-content/uploads/...`).
  Éles átállás előtt a WordPress-exportból át kell hozni őket az `assets/` alá.
- A menüpontok és projektlinkek a régi oldal aloldalaira mutatnak, amíg azok is át nem kerülnek.
- A `noindex` (HTML meta és `_headers`) élesítéskor törlendő.

## Helyi előnézet

```
cd public && python3 -m http.server 8000
```
