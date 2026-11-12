(() => {
  // Mobil menü
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("fomenu");
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Bezárás" : "Menü";
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Periódusos rendszer
  const table = document.querySelector(".ptable");
  if (!table) return;

  const info = table.querySelector(".ptable__info");
  const text = info.querySelector(".info__text");
  const fig = info.querySelector(".info__fig");
  const img = info.querySelector(".info__img");
  const initial = { html: text.innerHTML, src: img.getAttribute("src"), alt: img.getAttribute("alt") };
  const tiles = [...table.querySelectorAll(".el")];
  let selected = null;
  let shown = null;

  const render = (tile) => {
    if (tile === shown) return;
    shown = tile;
    if (!tile) {
      delete info.dataset.cat;
      text.innerHTML = initial.html;
      img.src = initial.src;
      img.alt = initial.alt;
      fig.hidden = false;
      return;
    }
    const detail = tile.parentElement.querySelector(".el__detail");
    info.dataset.cat = tile.dataset.cat;
    text.innerHTML = detail.innerHTML;
    const src = detail.dataset.img;
    if (src) {
      img.src = src;
      img.alt = detail.dataset.alt || "";
      fig.hidden = false;
    } else {
      fig.hidden = true;
    }
  };

  // Képek előtöltése, hogy a váltás ne villogjon
  const preload = () => {
    table.querySelectorAll(".el__detail[data-img]").forEach((d) => {
      const i = new Image();
      i.src = d.dataset.img;
    });
  };
  if ("requestIdleCallback" in window) requestIdleCallback(preload);
  else setTimeout(preload, 1500);

  const select = (tile) => {
    selected = selected === tile ? null : tile;
    tiles.forEach((t) => t.setAttribute("aria-pressed", String(t === selected)));
    render(selected);
    // Keskeny képernyőn a kiolvasó a csempék alatt van: görgessük láthatóvá
    if (selected && window.matchMedia("(max-width: 1199px)").matches) {
      const r = info.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        info.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
      }
    }
  };

  const canHover = window.matchMedia("(hover: hover)").matches;

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => select(tile));
    if (canHover) tile.addEventListener("mouseenter", () => render(tile));
  });

  if (canHover) {
    // A teljes táblázatot figyeljük, hogy a kiolvasóban lévő linkre át lehessen vinni az egeret
    table.addEventListener("mouseleave", () => render(selected));
  }

  // Szűrés közönség szerint
  const keys = table.querySelectorAll("button.key");
  keys.forEach((key) => {
    key.addEventListener("click", () => {
      const active = key.getAttribute("aria-pressed") === "true";
      keys.forEach((k) => k.setAttribute("aria-pressed", "false"));
      if (active) {
        table.dataset.filter = "";
      } else {
        key.setAttribute("aria-pressed", "true");
        table.dataset.filter = key.dataset.cat;
      }
    });
  });
})();
