/* Demos page: markdown editor, file explorer, handoff pipeline, code block, blind-spot check. */
(function () {
  "use strict";
  const { $, $$, escapeHTML, store, toast } = window.AH;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     Tiny, safe markdown renderer. Escapes everything first, then
     adds a small set of tags. Enough for headings, lists, tasks,
     bold/italic, inline + fenced code, quotes, links and rules.
  --------------------------------------------------------------- */
  function inline(s) {
    return s
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function md(src) {
    const lines = escapeHTML(src).split("\n");
    let html = "", list = null, para = [], inCode = false, code = [];
    const flushPara = () => { if (para.length) { html += `<p>${inline(para.join(" "))}</p>`; para = []; } };
    const closeList = () => { if (list) { html += `</${list}>`; list = null; } };
    const openList = (t) => { if (list !== t) { closeList(); html += `<${t}>`; list = t; } };
    for (const raw of lines) {
      const line = raw.replace(/\s+$/, "");
      if (/^```/.test(line)) {
        if (inCode) { html += `<pre><code>${code.join("\n")}</code></pre>`; code = []; inCode = false; }
        else { flushPara(); closeList(); inCode = true; }
        continue;
      }
      if (inCode) { code.push(raw); continue; }
      let m;
      if (!line.trim()) { flushPara(); closeList(); continue; }
      if ((m = line.match(/^(#{1,3})\s+(.*)$/))) { flushPara(); closeList(); const n = m[1].length; html += `<h${n}>${inline(m[2])}</h${n}>`; continue; }
      if (/^(-{3,}|\*{3,})$/.test(line.trim())) { flushPara(); closeList(); html += "<hr>"; continue; }
      if ((m = line.match(/^&gt;\s?(.*)$/))) { flushPara(); closeList(); html += `<blockquote>${inline(m[1])}</blockquote>`; continue; }
      if ((m = line.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/))) { flushPara(); openList("ul"); html += `<li class="task"><input type="checkbox" disabled${m[1].trim() ? " checked" : ""}>${inline(m[2])}</li>`; continue; }
      if ((m = line.match(/^\s*[-*]\s+(.*)$/))) { flushPara(); openList("ul"); html += `<li>${inline(m[1])}</li>`; continue; }
      if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) { flushPara(); openList("ol"); html += `<li>${inline(m[1])}</li>`; continue; }
      closeList(); para.push(line.trim());
    }
    if (inCode) html += `<pre><code>${code.join("\n")}</code></pre>`;
    flushPara(); closeList();
    return html;
  }
  window.AH.md = md;

  function download(name, text) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ===================== 01 MARKDOWN ===================== */
  const MD_EXAMPLE = `# My Plan — October

## This week
- [x] Get a free email
- [ ] Get my state ID
- [ ] Ask about the warehouse job at **Smith Supply**

## Things to remember
- Bus 51 stops right outside the library
- Bring \`2 forms of ID\` to the DMV
- Library computers: **1 hour per day**

## Big goal
> Own place by spring. One step at a time.
`;
  const mdIn = $("#mdIn"), mdOut = $("#mdOut");
  const MD_KEY = "ah.lab.md";
  mdIn.value = store.get(MD_KEY, MD_EXAMPLE);
  const renderMd = () => { mdOut.innerHTML = md(mdIn.value); store.set(MD_KEY, mdIn.value); };
  mdIn.addEventListener("input", renderMd);
  renderMd();
  $("#mdReset").addEventListener("click", () => { mdIn.value = MD_EXAMPLE; renderMd(); });
  $("#mdDownload").addEventListener("click", () => { download("my-plan.md", mdIn.value); toast("Saved my-plan.md to your downloads"); });
  $$(".md-tools button").forEach(b => b.addEventListener("click", () => {
    const s = mdIn.selectionStart, e = mdIn.selectionEnd, v = mdIn.value;
    if (b.dataset.ins) {
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      const pre = lineStart === s && (s === 0 || v[s - 1] === "\n") ? "" : "\n";
      const ins = pre + b.dataset.ins;
      mdIn.value = v.slice(0, s) + ins + v.slice(e);
      mdIn.selectionStart = mdIn.selectionEnd = s + ins.length;
    } else {
      const w = b.dataset.wrap, sel = v.slice(s, e) || "text";
      mdIn.value = v.slice(0, s) + w + sel + w + v.slice(e);
      mdIn.selectionStart = s + w.length; mdIn.selectionEnd = s + w.length + sel.length;
    }
    mdIn.focus(); renderMd();
  }));

  /* ===================== 02 FILES & FOLDERS ===================== */
  const FX_KEY = "ah.lab.fx.v1";
  let uid = 1;
  const mk = (name, type, content) => ({ id: uid++, name, type, children: type === "dir" ? [] : undefined, content: content || "" });
  let root = store.get(FX_KEY, null);
  if (!root) root = mk("My Stuff", "dir");
  (function fixIds(n) { uid = Math.max(uid, n.id + 1); (n.children || []).forEach(fixIds); })(root);
  let selId = root.id, building = false;

  function find(id, n = root, trail = []) {
    const t = trail.concat(n);
    if (n.id === id) return t;
    for (const c of n.children || []) { const r = find(id, c, t); if (r) return r; }
    return null;
  }
  const save = () => store.set(FX_KEY, root);
  const sortKids = (n) => n.children.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1));

  function treeHTML(n) {
    const icon = n.type === "dir" ? "📁" : "📄";
    let h = `<li role="treeitem"><div class="fx-item${n.id === selId ? " sel" : ""}" data-id="${n.id}" tabindex="0"><span class="ic">${icon}</span>${escapeHTML(n.name)}</div>`;
    if (n.children && n.children.length) h += `<ul role="group">${n.children.map(treeHTML).join("")}</ul>`;
    return h + "</li>";
  }
  function renderFx() {
    $("#fxTree").innerHTML = treeHTML(root);
    const trail = find(selId) || [root];
    const node = trail[trail.length - 1];
    $("#fxPath").innerHTML = trail.map((n, i) => i === trail.length - 1 ? `<b>${escapeHTML(n.name)}</b>` : escapeHTML(n.name)).join(" / ");
    const body = $("#fxBody");
    if (node.type === "dir") {
      body.innerHTML = node.children.length
        ? `<div class="fx-grid">${node.children.map(c => `<button type="button" class="fx-tile" data-id="${c.id}"><span class="big">${c.type === "dir" ? "📁" : "📄"}</span>${escapeHTML(c.name)}</button>`).join("")}</div>`
        : `<p class="fx-empty">This folder is empty. Type a name below and make a folder or a file.</p>`;
    } else {
      body.innerHTML = `<textarea id="fxEdit" spellcheck="false" style="min-height:240px;font:14px/1.6 var(--mono)" aria-label="File contents">${escapeHTML(node.content)}</textarea>
        <div class="btn-row" style="margin-top:10px"><button type="button" class="copy" id="fxDl">↓ Download ${escapeHTML(node.name)}</button><button type="button" class="copy" id="fxDel">Delete file</button></div>`;
      $("#fxEdit").addEventListener("input", e => { node.content = e.target.value; save(); });
      $("#fxDl").addEventListener("click", () => download(node.name, node.content));
      $("#fxDel").addEventListener("click", () => {
        const parent = trail[trail.length - 2];
        parent.children = parent.children.filter(c => c !== node);
        selId = parent.id; save(); renderFx();
      });
    }
    $$("#fxForm button").forEach(b => (b.disabled = building));
  }
  document.getElementById("fx").addEventListener("click", e => {
    const t = e.target.closest("[data-id]"); if (!t || building) return;
    selId = +t.dataset.id; renderFx();
  });
  $("#fxTree").addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.dataset.id) { selId = +e.target.dataset.id; renderFx(); }
  });

  function addItem(name, kind) {
    const trail = find(selId); let parent = trail[trail.length - 1];
    if (parent.type !== "dir") parent = trail[trail.length - 2];
    name = name.trim().replace(/[\/\\]/g, "-").slice(0, 40);
    if (!name) { toast("Type a name first"); $("#fxName").focus(); return null; }
    if (kind === "file" && !/\.[a-z0-9]{1,5}$/i.test(name)) name += ".md";
    if (parent.children.some(c => c.name.toLowerCase() === name.toLowerCase())) { toast(`“${name}” already exists here`); return null; }
    const n = mk(name, kind, kind === "file" ? `# ${name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")}\n\n` : "");
    parent.children.push(n); sortKids(parent);
    if (kind === "dir") selId = n.id;
    save(); renderFx();
    return n;
  }
  let submitKind = "dir";
  $$("#fxForm button").forEach(b => b.addEventListener("click", () => (submitKind = b.dataset.kind)));
  $("#fxForm").addEventListener("submit", e => {
    e.preventDefault();
    const kind = (e.submitter && e.submitter.dataset.kind) || submitKind;
    if (addItem($("#fxName").value, kind)) $("#fxName").value = "";
  });
  $("#fxClear").addEventListener("click", () => { if (building) return; root = mk("My Stuff", "dir"); selId = root.id; save(); renderFx(); });

  const EXAMPLE_TREE = [
    ["dir", "Jobs", [
      ["file", "resume.md", "# Marcus Johnson\nmarcus.johnson@gmail.com · (555) 010-2233\n\n## Experience\n- **Line cook**, Rosie's Diner — 2021–2022\n- **Warehouse associate**, Smith Supply — 2019–2021\n\n## Skills\n- Forklift certified\n- Food handler card\n"],
      ["file", "cover-letter.md", "# Cover letter — Smith Supply\n\nHi, I'm Marcus. I worked in your warehouse from 2019 to 2021…\n"],
      ["file", "interview-notes.md", "# Interview prep\n\n- [ ] Tell me about yourself (30 sec)\n- [ ] Why I left my last job\n- [ ] 2 questions to ask them\n"],
    ]],
    ["dir", "ID & Papers", [
      ["file", "id-checklist.md", "# State ID checklist\n\n- [ ] Birth certificate\n- [ ] Proof of address (shelter letter works)\n- [ ] Social Security card\n- [ ] Fee waiver form\n"],
      ["file", "phone-numbers.md", "# Important numbers\n\n- Caseworker: Ms. Rivera\n- Help line: 211\n"],
    ]],
    ["dir", "Goals", [
      ["file", "2026-plan.md", "# 2026 plan\n\n## By December\n- Full-time job\n- $1,000 saved\n\n## By spring\n- Own place\n"],
    ]],
    ["dir", "My Story", [
      ["file", "chapter-1.md", "# Chapter 1\n\nI grew up in…\n"],
    ]],
  ];
  const wait = (ms) => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  $("#fxDemo").addEventListener("click", async () => {
    if (building) return;
    building = true;
    root = mk("My Life", "dir"); selId = root.id; renderFx();
    for (const [, dname, files] of EXAMPLE_TREE) {
      await wait(450);
      selId = root.id;
      const d = mk(dname, "dir"); root.children.push(d); selId = d.id; renderFx();
      for (const [, fname, content] of files) {
        await wait(320);
        d.children.push(mk(fname, "file", content)); renderFx();
      }
    }
    await wait(400);
    building = false;
    selId = root.children[0].children[0].id; // open resume.md
    save(); renderFx();
    toast("Done — click any file to open it");
  });
  renderFx();

  /* ===================== 03 HANDOFF ===================== */
  const site = (o) => `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    *{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;background:${o.bg}}
    .h{padding:28px 20px;background:${o.hero};color:#fff}.h small{opacity:.8;font-weight:600;letter-spacing:.06em;text-transform:uppercase;font-size:11px}
    .h h1{margin:6px 0 6px;font-size:26px;line-height:1.1;letter-spacing:-.02em}.h p{margin:0 0 14px;opacity:.9}
    .b{display:inline-block;background:#fff;color:${o.accent};font-weight:700;padding:10px 14px;border-radius:9px;text-decoration:none}
    .s{padding:18px 20px}.s h2{font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin:0 0 10px}
    .g{display:grid;grid-template-columns:1fr 1fr;gap:8px}.c{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px}
    .c b{display:block}.c span{color:#64748b;font-size:13px}.f{padding:14px 20px;color:#64748b;font-size:12px}
  </style></head><body>
  <div class="h"><small>${o.kicker}</small><h1>${o.title}</h1><p>${o.sub}</p><a class="b" href="#">${o.cta}</a></div>
  <div class="s"><h2>${o.listTitle}</h2><div class="g">${o.items.map(([b, s]) => `<div class="c"><b>${b}</b><span>${s}</span></div>`).join("")}</div></div>
  <div class="f">${o.foot}</div></body></html>`;

  const SCEN = [
    {
      name: "🚿 Pressure-washing side hustle",
      talk: "ok so i do pressure washing on the weekends, driveways decks fences, i want like a simple page people can see when i give them my number, i charge like 80 for a driveway and 120 for a deck and fences depend, i want it to look clean not cheesy, blue maybe, and a big button to text me, oh and say i'm insured. my name is dre",
      plan: `# Project: Dre's Pressure Washing — one-page site

## Goal
A simple page I can text to customers. Main action: **text me**.

## Must have
- Big headline: "Dre's Pressure Washing"
- Short line: weekend service, insured
- Big "Text Dre" button
- Prices:
  - Driveway — $80
  - Deck — $120
  - Fence — ask for a quote

## Style
- Clean, modern, blue and white
- Big readable text, works on phones
- No cheesy stock photos

## Deliver
One HTML file, ready to open.`,
      site: { bg: "#f1f5ff", hero: "linear-gradient(135deg,#1d4ed8,#3b82f6)", accent: "#1d4ed8", kicker: "Weekends · Fully insured", title: "Dre's Pressure Washing", sub: "Driveways, decks and fences — like new.", cta: "💬 Text Dre", listTitle: "Prices", items: [["Driveway", "$80"], ["Deck", "$120"], ["Fence", "Ask for a quote"], ["Insured", "✓ Yes"]], foot: "© Dre's Pressure Washing" },
    },
    {
      name: "🥫 Church food pantry hours",
      talk: "our church does a food pantry and people keep calling to ask when it's open. it's tuesdays 4 to 6 and saturdays 10 to 12, at grace church on 5th street. no id needed. we also do diapers sometimes. it needs to be super simple, some people only have old phones. maybe green",
      plan: `# Project: Grace Church Food Pantry — info page

## Goal
Stop the phone calls. Anyone can see hours in 5 seconds.

## Must have
- Title: "Free Food Pantry"
- Where: Grace Church, 5th Street
- Hours (big and clear):
  - Tuesday — 4–6 pm
  - Saturday — 10 am–12 pm
- **No ID needed**
- Note: diapers sometimes available

## Style
- Green, calm, very simple
- Loads fast on old phones (no big images)

## Deliver
One HTML file.`,
      site: { bg: "#f0fdf4", hero: "linear-gradient(135deg,#15803d,#22c55e)", accent: "#15803d", kicker: "Grace Church · 5th Street", title: "Free Food Pantry", sub: "Everyone welcome. No ID needed.", cta: "📍 Get directions", listTitle: "Hours", items: [["Tuesday", "4–6 pm"], ["Saturday", "10 am–12 pm"], ["No ID", "needed"], ["Diapers", "Sometimes"]], foot: "Questions? Ask at the front desk." },
    },
    {
      name: "🧑‍🍳 My resume as a website",
      talk: "can you make my resume into like a little website i can send to managers. i'm a line cook, 4 years, did prep, grill, closing shifts, i have my food handlers card and i'm good under pressure. i want it to look professional, dark orange or something. my email is jay.reyes@gmail.com",
      plan: `# Project: Jay Reyes — personal resume site

## Goal
A link I can send to restaurant managers.

## Must have
- Name + title: "Jay Reyes — Line Cook"
- One line: 4 years in busy kitchens
- Skills: prep, grill, closing
- Certificate: Food Handler Card
- Strength: calm under pressure
- Button: email jay.reyes@gmail.com

## Style
- Professional, warm orange accent
- Clean and short — one screen

## Deliver
One HTML file.`,
      site: { bg: "#fff7ed", hero: "linear-gradient(135deg,#c2410c,#f97316)", accent: "#c2410c", kicker: "Line Cook · 4 years", title: "Jay Reyes", sub: "Fast, clean and calm in a busy kitchen.", cta: "✉️ Email Jay", listTitle: "What I bring", items: [["Prep", "Every station"], ["Grill", "High volume"], ["Closing", "Reliable"], ["Certified", "Food Handler"]], foot: "jay.reyes@gmail.com" },
    },
  ];
  let sc = 0, stage = 0, typer = null;
  $("#hoPick").innerHTML = SCEN.map((s, i) => `<button type="button" data-i="${i}">${s.name}</button>`).join("");
  $("#hoPick").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { sc = +b.dataset.i; resetHo(); } });
  function setStages() {
    ["#st1", "#st2", "#st3"].forEach((s, i) => {
      $(s).classList.toggle("idle", i + 1 > stage);
      $(s).classList.toggle("active", i + 1 === stage);
    });
    [...$("#hoPick").children].forEach((b, i) => b.classList.toggle("on", i === sc));
    const hints = ["Press “Next step” to start.", "Step 1: just talk. Typos and all.", "Step 2: AI #1 turns it into a clean plan.", "Step 3: paste the plan in a NEW chat → built."];
    $("#hoHint").textContent = hints[stage];
    $("#hoNext").textContent = stage >= 3 ? "Try another →" : "Next step →";
  }
  function resetHo() {
    clearInterval(typer); stage = 0;
    $("#st1b").innerHTML = '<p class="muted small">Your messy message goes here.</p>';
    $("#st2b").textContent = "";
    $("#st3b").innerHTML = "";
    setStages();
  }
  function typeInto(el, text, speed, done) {
    clearInterval(typer);
    if (reduce) { el.textContent = text; done && done(); return; }
    let i = 0;
    typer = setInterval(() => {
      i = Math.min(text.length, i + speed);
      el.textContent = text.slice(0, i);
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
      if (i >= text.length) { clearInterval(typer); done && done(); }
    }, 16);
  }
  $("#hoNext").addEventListener("click", () => {
    const s = SCEN[sc];
    if (stage >= 3) { sc = (sc + 1) % SCEN.length; resetHo(); return; }
    stage++; setStages();
    if (stage === 1) {
      $("#st1b").innerHTML = `<div class="msg me" style="max-width:100%">${escapeHTML(s.talk)}</div>`;
    } else if (stage === 2) {
      typeInto($("#st2b"), s.plan, 6);
    } else if (stage === 3) {
      clearInterval(typer); $("#st2b").textContent = s.plan;
      const f = document.createElement("iframe");
      f.setAttribute("sandbox", ""); f.title = "Built website preview";
      f.srcdoc = site(s.site);
      $("#st3b").innerHTML = ""; $("#st3b").appendChild(f);
    }
  });
  $("#hoReplay").addEventListener("click", resetHo);
  resetHo();

  /* ===================== 04 CODE BLOCK ===================== */
  const EMAIL = `Subject: Following up — Line Cook application

Hi Ms. Patel,

Thank you for meeting with me on Tuesday. I really enjoyed learning about the kitchen at Rosie's. I'm excited about the line cook position and I'm available to start right away.

Please let me know if you need anything else from me.

Thank you,
Jay Reyes
jay.reyes@gmail.com`;
  function renderCb(m) {
    [...$("#cbTabs").children].forEach((b, i) => b.classList.toggle("on", i === m));
    const me = `<div class="msg me">Write a thank-you email to the manager I interviewed with${m ? ". <b>Write this in a code block for me.</b>" : "."}</div>`;
    const ai = m
      ? `<div class="msg ai" style="max-width:100%;width:100%"><span class="who">AI</span>Here's your email — tap copy:
          <div class="codebox" style="margin-top:10px"><div class="codebox-head">email <button class="copy" type="button" data-copy><span class="copy-label">Copy</span></button></div><pre>${escapeHTML(EMAIL)}</pre></div></div>`
      : `<div class="msg ai" style="max-width:100%"><span class="who">AI</span>Great idea! Sending a thank-you note is a smart move — it shows you're professional. Here's a draft you could use: ${escapeHTML(EMAIL).replace(/\n+/g, " ")} Feel free to tweak it so it sounds like you! Want me to make it shorter or more formal? Let me know if you'd like any other tips for following up after an interview.</div>`;
    $("#cbChat").innerHTML = me + ai;
    $("#cbNote").innerHTML = m
      ? "✓ Clean. One tap copies <b>exactly</b> the email — no extra chatter. Paste it into Gmail and hit send."
      : "✕ The email is buried in the middle of the chatter. Now try to copy just the email on a phone. Annoying, right? Flip the switch.";
  }
  $("#cbTabs").addEventListener("click", e => { const b = e.target.closest("button"); if (b) renderCb(+b.dataset.m); });
  renderCb(0);

  /* ===================== 05 WHAT AM I MISSING ===================== */
  const MISS = [
    {
      name: "💼 Job interview tomorrow",
      plan: "My plan for my interview tomorrow:\n- Wear clean clothes\n- Show up on time",
      out: [
        ["Look up the company for 10 minutes", "They almost always ask “why do you want to work here?” Knowing one thing about them makes you stand out."],
        ["Plan your route and leave 20 minutes early", "Buses run late. Showing up late is the #1 way to lose the job before you start."],
        ["Practice “tell me about yourself”", "It's usually the first question. A 30-second answer sets the tone for everything else."],
        ["Bring 2 questions to ask them", "Asking questions shows you're serious. “What does a great first month look like?” works every time."],
        ["Have a copy of your resume (or your email ready)", "If they ask for it, you look prepared instead of scrambling."],
      ],
    },
    {
      name: "🏠 Apartment application",
      plan: "I'm going to apply for an apartment this weekend.\nI'll bring my pay stub and fill out the form.",
      out: [
        ["Bring photo ID", "Almost every landlord needs it. No ID = no application."],
        ["Bring 2–3 recent pay stubs, not one", "Most landlords want proof of steady income, usually 2–3 months."],
        ["Ask about the application fee first", "Fees can cost real money and usually don't come back. Know before you pay."],
        ["Have references ready", "A past landlord, caseworker or boss. Names + phone numbers."],
        ["Ask if they accept your housing voucher (if you have one)", "Some don't. Asking first saves you a wasted fee."],
      ],
    },
    {
      name: "💵 Starting a side hustle",
      plan: "I want to start cutting grass for money.\nI have a mower. I'll put flyers up in my neighborhood.",
      out: [
        ["Decide your prices before the first call", "If someone asks and you hesitate, you'll undercharge. Write it down: small yard $X, big yard $Y."],
        ["Get a way for people to reach you", "Put a phone number or your new email on the flyer. No way to reach you = no customers."],
        ["Gas, trimmer line and getting there", "These eat your profit. Add them up so you know what you actually make."],
        ["Take before & after photos", "Best free advertising there is. Post them and show them to the next customer."],
        ["Ask happy customers to tell neighbors", "Word of mouth gets you more jobs than flyers ever will."],
      ],
    },
  ];
  let ms = 0, msTimers = [];
  $("#msPick").innerHTML = MISS.map((s, i) => `<button type="button" data-i="${i}">${s.name}</button>`).join("");
  function renderMs() {
    msTimers.forEach(clearTimeout); msTimers = [];
    [...$("#msPick").children].forEach((b, i) => b.classList.toggle("on", i === ms));
    $("#msPlan").textContent = MISS[ms].plan;
    $("#msOut").innerHTML = '<p class="muted" style="margin:10px 0 0">Press the button to see what a good AI answer looks like.</p>';
    $("#msGo").disabled = false;
  }
  $("#msPick").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { ms = +b.dataset.i; renderMs(); } });
  $("#msGo").addEventListener("click", () => {
    $("#msGo").disabled = true;
    $("#msOut").innerHTML = "";
    MISS[ms].out.forEach(([b, why], i) => {
      msTimers.push(setTimeout(() => {
        $("#msOut").insertAdjacentHTML("beforeend", `<div class="missing-item"><span class="ic">${i + 1}</span><div><b>${escapeHTML(b)}</b><span>${escapeHTML(why)}</span></div></div>`);
      }, reduce ? 0 : 250 + i * 380));
    });
  });
  renderMs();
})();
