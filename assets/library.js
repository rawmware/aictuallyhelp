/* Prompt library + flip book. Used by the home page and the prompts page.
   Needs site.js and prompts.js loaded first. */
(function () {
  "use strict";
  const { $, escapeHTML, markBlanks } = window.AH;
  const P = window.PROMPTS, CATS = window.PROMPT_CATS;
  const catName = Object.fromEntries(CATS.map((c) => [c.id, c.name]));
  const inCat = (p, c) => c === "all" || (c === "fame" ? p.fame : p.cat === c);

  // One prompt card: use case on top, the prompt in a copyable code block.
  function card(p) {
    return `
      <article class="ucard" id="p-${p.id}">
        <div class="uc-use">
          <span class="uc-k">${p.fame ? '<span style="color:var(--amber)">★</span> ' : ""}use case · ${escapeHTML(catName[p.cat])}</span>
          <h3>${escapeHTML(p.title)}</h3>
        </div>
        <div class="codebox">
          <div class="codebox-head"><span>prompt</span><button class="copy" type="button" data-copy><span class="copy-label">Copy</span></button></div>
          <pre>${markBlanks(p.text)}</pre>
        </div>
        ${p.tip ? `<p class="uc-tip">${escapeHTML(p.tip)}</p>` : ""}
      </article>`;
  }

  function mountLibrary(root) {
    let cat = "all";
    root.innerHTML = `
      <div class="toolbar"><div class="wrap">
        <div class="search"><input type="search" placeholder="What do you need? Try “email”, “resume”, “rent”, “website”…" aria-label="Search prompts"><kbd>/</kbd></div>
        <div class="filters" role="tablist"></div>
      </div></div>
      <div class="wrap"><div class="prompt-list" aria-live="polite"></div></div>`;
    const q = root.querySelector("input"), filters = root.querySelector(".filters"), list = root.querySelector(".prompt-list");
    filters.innerHTML = CATS.map((c) =>
      `<button type="button" data-c="${c.id}">${c.name}<span class="ct">${P.filter((p) => inCat(p, c.id)).length}</span></button>`).join("");
    function render() {
      const term = q.value.trim().toLowerCase();
      [...filters.children].forEach((b) => b.classList.toggle("on", b.dataset.c === cat));
      const items = P.filter((p) => inCat(p, cat) && (!term || (p.title + " " + p.text + " " + p.tip + " " + catName[p.cat]).toLowerCase().includes(term)));
      list.innerHTML = items.length ? items.map(card).join("")
        : `<div class="empty">Nothing matches “${escapeHTML(term)}”. Try a simpler word — or copy this and ask your AI directly:<div class="codebox" style="max-width:560px;margin:16px auto 0;text-align:left"><div class="codebox-head"><span>prompt</span><button class="copy" type="button" data-copy><span class="copy-label">Copy</span></button></div><pre>I need help with ${escapeHTML(term)}. Ask me questions one at a time until you understand what I need. Then help me.</pre></div></div>`;
    }
    filters.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      cat = b.dataset.c; render();
    });
    q.addEventListener("input", render);
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        e.preventDefault(); q.focus(); q.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    });
    render();
  }

  // Flip book: rotates through every prompt. Top 3 first, then shuffled.
  function mountFlip(root, opts = {}) {
    const interval = opts.interval || 5000;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rest = P.filter((p) => !p.fame);
    for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
    const deck = P.filter((p) => p.fame).concat(rest);
    let i = 0, paused = false, hover = false, timer = null, busy = false;

    root.innerHTML = `
      <div class="flip-stack">
        <div class="flip-card" aria-live="polite"></div>
      </div>
      <div class="flip-ctrl">
        <button type="button" class="flip-btn" data-a="prev" aria-label="Previous prompt">‹</button>
        <span class="flip-count"></span>
        <div class="flip-timer"><i></i></div>
        <button type="button" class="flip-btn" data-a="pause" aria-label="Pause">❚❚</button>
        <button type="button" class="flip-btn" data-a="next" aria-label="Next prompt">›</button>
      </div>`;
    const cardEl = root.querySelector(".flip-card"), count = root.querySelector(".flip-count"),
      bar = root.querySelector(".flip-timer i"), pauseBtn = root.querySelector('[data-a="pause"]');

    function paint() {
      const p = deck[i];
      cardEl.innerHTML = `
        <div class="flip-top"><span class="tag ${p.fame ? "amber" : "blue"}">${p.fame ? "★ top 3" : escapeHTML(catName[p.cat])}</span><span class="mono small" style="color:var(--faint)">use case</span></div>
        <h3 class="flip-use">${escapeHTML(p.title)}</h3>
        <div class="codebox">
          <div class="codebox-head"><span>prompt · tap copy, paste into your AI</span><button class="copy" type="button" data-copy><span class="copy-label">Copy</span></button></div>
          <pre>${markBlanks(p.text)}</pre>
        </div>
        ${p.tip ? `<p class="uc-tip">${escapeHTML(p.tip)}</p>` : ""}`;
      count.textContent = `${String(i + 1).padStart(2, "0")} / ${deck.length}`;
    }
    function restartBar() {
      bar.style.transition = "none"; bar.style.width = "0";
      if (paused || hover || reduce) return;
      void bar.offsetWidth;
      bar.style.transition = `width ${interval}ms linear`; bar.style.width = "100%";
    }
    function schedule() {
      clearTimeout(timer);
      restartBar();
      if (!paused && !hover && !reduce) timer = setTimeout(() => go(1), interval);
    }
    function go(d) {
      if (busy) return;
      i = (i + d + deck.length) % deck.length;
      if (reduce) { paint(); schedule(); return; }
      busy = true;
      cardEl.classList.add(d > 0 ? "flip-out" : "flip-out-back");
      setTimeout(() => {
        paint();
        cardEl.classList.remove("flip-out", "flip-out-back");
        cardEl.classList.add(d > 0 ? "flip-in" : "flip-in-back");
        setTimeout(() => { cardEl.classList.remove("flip-in", "flip-in-back"); busy = false; }, 280);
        schedule();
      }, 260);
    }
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      if (b.dataset.a === "next") go(1);
      else if (b.dataset.a === "prev") go(-1);
      else { paused = !paused; pauseBtn.textContent = paused ? "▶" : "❚❚"; pauseBtn.setAttribute("aria-label", paused ? "Play" : "Pause"); schedule(); }
    });
    // Hold still while someone is reading or copying.
    root.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hover = true; schedule(); } });
    root.addEventListener("pointerleave", () => { if (hover) { hover = false; schedule(); } });
    root.addEventListener("focusin", () => { hover = true; schedule(); });
    root.addEventListener("focusout", () => { hover = false; schedule(); });
    // Swipe on phones.
    let sx = null;
    cardEl.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    cardEl.addEventListener("touchend", (e) => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    });
    document.addEventListener("visibilitychange", () => { if (document.hidden) clearTimeout(timer); else schedule(); });
    paint(); schedule();
  }

  window.AH.promptCard = card;
  window.AH.mountLibrary = mountLibrary;
  window.AH.mountFlip = mountFlip;
})();
