/* aictuallyhelp — shared behavior: copy buttons, toast, scroll reveal, confetti. */
(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Wrap [LIKE THIS] placeholders so people can see what to fill in.
  function markBlanks(text) {
    return escapeHTML(text).replace(/\[([^\]]+)\]/g, '<span class="blank">[$1]</span>');
  }

  let toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback for older phones / non-secure contexts.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) {}
      ta.remove();
      return ok;
    }
  }

  // Any button with [data-copy] copies: its data-copy text, or the text of
  // the element matched by data-copy-from, or the nearest <pre>.
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    let text = btn.getAttribute("data-copy");
    if (!text) {
      const sel = btn.getAttribute("data-copy-from");
      const src = sel ? $(sel) : btn.closest(".codebox, .pcard, .fame-card")?.querySelector("pre");
      text = src ? ("value" in src && src.tagName !== "PRE" ? src.value : src.innerText) : "";
    }
    const ok = await copyText(text.trim());
    const label = btn.querySelector(".copy-label") || btn;
    const old = label.textContent;
    btn.classList.add("done");
    label.textContent = ok ? "Copied ✓" : "Press & hold to copy";
    toast(ok ? "Copied — now paste it into ChatGPT, Claude or Gemini" : "Couldn't copy automatically");
    setTimeout(() => { btn.classList.remove("done"); label.textContent = old; }, 1600);
  });

  // Scroll reveal
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px" })
    : null;
  function observeReveals(root = document) {
    $$(".reveal", root).forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
  }
  observeReveals();

  function confetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = document.createElement("div");
    box.className = "confetti";
    const colors = ["#2257f5", "#0f9f6e", "#6d4aff", "#d63d8f", "#ffbd2e"];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dx", (Math.random() * 200 - 100) + "px");
      p.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
      p.style.animationDuration = 1.8 + Math.random() * 1.6 + "s";
      p.style.animationDelay = Math.random() * .4 + "s";
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 4200);
  }

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
  };

  window.AH = { $, $$, escapeHTML, markBlanks, toast, copyText, confetti, store, observeReveals };
})();
