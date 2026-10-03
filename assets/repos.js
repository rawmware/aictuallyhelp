/* Fresh repos: reads the live feed that github.fetch commits to GitHub every 15 minutes.
   Needs site.js loaded first. Source: https://github.com/rawmware/github.fetch */
(function () {
  "use strict";
  const { $, escapeHTML: esc } = window.AH;
  const FEED = "https://raw.githubusercontent.com/rawmware/github.fetch/main/data/feed.json";
  const PAGE = 24;
  const LEVELS = [
    { id: "all", name: "All" },
    { id: "instant", name: "Runs in a tab", tag: "green", short: "no account" },
    { id: "account", name: "Free account", tag: "blue", short: "free account" },
    { id: "heavy", name: "Needs a GPU / device", tag: "amber", short: "heavy" },
    { id: "read", name: "Just read it", tag: "", short: "read only" },
  ];
  const levelOf = Object.fromEntries(LEVELS.map((l) => [l.id, l]));
  // Only ever link to these hosts.
  const HOSTS = ["github.com", "github.dev", "stackblitz.com", "codesandbox.io", "codespaces.new", "colab.research.google.com", "mybinder.org", "raw.githack.com"];
  const safe = (u) => { try { const x = new URL(u); return x.protocol === "https:" && HOSTS.includes(x.hostname) ? x.href : null; } catch (_) { return null; } };
  const nf = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

  function ago(iso) {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (!isFinite(s)) return "";
    if (s < 90) return "just now";
    if (s < 3600) return Math.round(s / 60) + " min ago";
    if (s < 86400 * 1.5) return Math.round(s / 3600) + " h ago";
    return Math.round(s / 86400) + " days ago";
  }

  function card(g) {
    const lv = levelOf[g.level] || levelOf.account;
    const links = (g.launch || []).map((l) => ({ ...l, url: safe(l.url) })).filter((l) => l.url);
    const [first, ...rest] = links;
    const cmds = [g.install, g.run].filter(Boolean).join("\n");
    return `
      <article class="rcard">
        <div class="top">
          <div class="meta">
            <span class="tag ${lv.tag}">${esc(lv.short)}</span>
            <span class="tag">${esc(g.stack && g.stack.label || "project")}</span>
            <span class="rstat">★ ${nf.format(g.stars || 0)}</span>
          </div>
          <h3><a href="${esc(safe(g.url) || "#")}" target="_blank" rel="noopener">${esc(g.owner)}/<b>${esc(g.name)}</b></a></h3>
          <p class="desc">${esc(g.description || "")}</p>
        </div>
        ${first ? `<div class="launch">
          <a class="btn btn-primary btn-sm" href="${esc(first.url)}" target="_blank" rel="noopener">Open in ${esc(first.label.replace(/^Open it live$/, "a new tab"))} <span class="arrow">→</span></a>
          <p class="small muted">${esc(first.note)} <span class="needs">Needs: ${esc(first.needs)}.</span></p>
        </div>` : ""}
        ${rest.length ? `<div class="more">${rest.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener" title="${esc(l.note)} Needs: ${esc(l.needs)}.">${esc(l.label)}</a>`).join("")}</div>` : ""}
        ${(g.notes || []).length ? `<p class="heads">${g.notes.map(esc).join(" ")}</p>` : ""}
        <details>
          <summary>Steps, prompt &amp; license</summary>
          ${cmds ? `<div class="codebox"><div class="codebox-head"><span>type this in the browser terminal</span><button class="copy" type="button" data-copy><span class="copy-label">Copy</span></button></div><pre>${esc(cmds)}</pre></div>` : ""}
          ${g.local ? `<div class="codebox"><div class="codebox-head"><span>or on your own computer</span><button class="copy" type="button" data-copy><span class="copy-label">Copy</span></button></div><pre>${esc(g.local)}</pre></div>` : ""}
          <p class="small muted">${esc(g.licenseNote || "")}</p>
        </details>
        <div class="act">
          <button class="copy" type="button" data-copy="${esc(g.prompt || "")}"><span class="copy-label">Copy “make it mine” prompt</span></button>
          <span class="small muted" title="${esc(g.addedAt)}">${esc(ago(g.addedAt))}</span>
        </div>
      </article>`;
  }

  function mount(root) {
    let feed = null, level = "all", shown = PAGE;
    root.innerHTML = `
      <div class="toolbar"><div class="wrap">
        <div class="search"><input type="search" placeholder="Search: “react”, “python”, “game”, “agent”…" aria-label="Search repos"><kbd>/</kbd></div>
        <div class="filters"></div>
      </div></div>
      <div class="wrap">
        <p class="small muted rcount" aria-live="polite"></p>
        <div class="repo-list" aria-busy="true"><div class="empty">Loading the newest repos…</div></div>
        <div class="btn-row more-row" hidden><button class="btn btn-ghost" type="button">Show more</button></div>
      </div>`;
    const q = $("input", root), filters = $(".filters", root), list = $(".repo-list", root), count = $(".rcount", root), moreRow = $(".more-row", root);

    function matches(g, term) {
      if (level !== "all" && g.level !== level) return false;
      if (!term) return true;
      return [g.fullName, g.description, g.language, g.stack && g.stack.label, (g.topics || []).join(" ")].join(" ").toLowerCase().includes(term);
    }
    function render() {
      const items = feed.items, term = q.value.trim().toLowerCase();
      filters.innerHTML = LEVELS.map((l) => `<button type="button" data-l="${l.id}" class="${l.id === level ? "on" : ""}">${esc(l.name)}<span class="ct">${l.id === "all" ? items.length : items.filter((g) => g.level === l.id).length}</span></button>`).join("");
      const hits = items.filter((g) => matches(g, term));
      list.innerHTML = hits.length ? hits.slice(0, shown).map(card).join("")
        : `<div class="empty">${items.length ? `Nothing matches “${esc(term)}”.` : "The first guides land within 15 minutes. Check back soon."}</div>`;
      count.textContent = hits.length ? `Showing ${Math.min(shown, hits.length)} of ${hits.length}` : "";
      moreRow.hidden = hits.length <= shown;
    }
    filters.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; level = b.dataset.l; shown = PAGE; render(); });
    q.addEventListener("input", () => { shown = PAGE; render(); });
    moreRow.addEventListener("click", () => { shown += PAGE; render(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); }
    });

    async function load() {
      list.setAttribute("aria-busy", "true");
      try {
        const res = await fetch(FEED, { cache: "no-cache" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const f = await res.json();
        if (f.schemaVersion !== 1 || !Array.isArray(f.items)) throw new Error("bad feed");
        feed = f;
        const today = new Date().toISOString().slice(0, 10);
        $("#st-total").textContent = (f.totalGuides || f.items.length).toLocaleString("en-US");
        $("#st-today").textContent = f.items.filter((g) => String(g.addedAt).slice(0, 10) === today).length;
        $("#st-instant").textContent = f.items.filter((g) => g.level === "instant").length;
        const upd = $("#st-updated");
        upd.textContent = f.updatedAt ? ago(f.updatedAt) : "soon";
        if (f.updatedAt) upd.title = new Date(f.updatedAt).toLocaleString();
        render();
      } catch (e) {
        list.innerHTML = `<div class="empty">Couldn't load the repo feed right now. <button class="btn btn-ghost btn-sm" type="button" data-retry>Try again</button></div>`;
        $("[data-retry]", list).addEventListener("click", load);
      }
      list.removeAttribute("aria-busy");
    }
    load();
  }

  window.AH.mountRepos = mount;
})();
