// Értékesítési réteg: a reteg.html tartalmát (lebegő fülek + ablakok) illeszti az oldal végére.
// A demóoldalak maguk JavaScript nélküliek; ez a fájl a rétegé, élesítéskor törlendő.
(() => {
  const nyit = (id) => {
    const ablak = document.getElementById(id);
    if (!ablak) return;
    document.querySelectorAll(".reteg-ablak[open]").forEach((d) => d.close());
    ablak.showModal();
  };

  fetch("/reteg/reteg.html", { credentials: "same-origin" })
    .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
    .then((html) => {
      const reteg = document.createElement("div");
      reteg.className = "reteg";
      reteg.innerHTML = html;
      document.body.appendChild(reteg);

      reteg.querySelectorAll("[data-nyit]").forEach((gomb) => {
        gomb.addEventListener("click", () => nyit(gomb.dataset.nyit));
      });

      reteg.querySelectorAll(".reteg-ablak").forEach((ablak) => {
        // kattintás az ablakon kívülre (a háttérre) bezárja
        ablak.addEventListener("click", (e) => {
          if (e.target === ablak) ablak.close();
        });
        ablak.querySelectorAll("[data-zar]").forEach((b) => b.addEventListener("click", () => ablak.close()));
      });
    })
    .catch(() => {
      /* ha a réteg nem tölthető be, az oldal enélkül is teljes */
    });
})();
