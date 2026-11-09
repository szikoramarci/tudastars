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

  // Periódusos rendszer: kiolvasó mező + szűrés
  const table = document.querySelector(".ptable");
  if (!table) return;

  const info = table.querySelector(".ptable__info");
  const infoTitle = info.querySelector(".info__title");
  const infoMeta = info.querySelector(".info__meta");
  const infoDesc = info.querySelector(".info__desc");
  const initial = {
    title: infoTitle.textContent,
    meta: infoMeta.textContent,
    desc: infoDesc.textContent,
  };

  const catLabels = {};
  table.querySelectorAll(".key").forEach((k) => {
    catLabels[k.dataset.cat] = k.textContent.trim();
  });

  const show = (el) => {
    const cat = el.dataset.cat;
    info.dataset.cat = cat;
    infoTitle.textContent = el.querySelector(".el__full").textContent;
    infoMeta.textContent = `${el.querySelector(".el__year").textContent} – ${catLabels[cat] || ""}`;
    infoDesc.textContent = el.querySelector(".el__desc").textContent;
  };

  const reset = () => {
    delete info.dataset.cat;
    infoTitle.textContent = initial.title;
    infoMeta.textContent = initial.meta;
    infoDesc.textContent = initial.desc;
  };

  table.querySelectorAll(".el").forEach((el) => {
    el.addEventListener("mouseenter", () => show(el));
    el.addEventListener("focus", () => show(el));
  });
  table.querySelector(".ptable__grid").addEventListener("mouseleave", reset);
  table.addEventListener("focusout", (e) => {
    if (!table.contains(e.relatedTarget)) reset();
  });

  const keys = table.querySelectorAll(".key");
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
