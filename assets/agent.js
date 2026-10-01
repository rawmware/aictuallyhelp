/* "Watch an agent work" — replays an illustrative agent run, step by step.
   Mode 1: one agent in a think → act → check loop (the ReAct pattern).
   Mode 2: a lead agent fans the job out to parallel subagents (orchestrator–workers). */
(function () {
  "use strict";
  const { escapeHTML } = window.AH;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const GOAL = "Find 3 free places to learn computer skills near me this month. Make me a one-page list with dates and how to sign up.";

  const SOLO = [
    ["think", "I need free computer classes nearby, happening this month. Start broad with a search."],
    ["tool", "web_search(\"free computer classes near me library\")"],
    ["result", "8 results: a public library “Tech Help” page, a job center workshop list, a community college course list…"],
    ["think", "The library looks promising, but I need the actual dates and to confirm it's free."],
    ["tool", "open_page(library → events → Tech Help)"],
    ["result", "“Tech Help: Tuesdays 2–4 pm. Free. Drop in, no sign-up.”"],
    ["think", "That's 1 of 3. Check the job center next."],
    ["tool", "open_page(job center → workshops)"],
    ["result", "“Computer Basics, the 14th, 10 am. Free. Sign up at the front desk.”"],
    ["think", "2 of 3. The college page was unclear about cost. Search more specifically."],
    ["tool", "web_search(\"community college free non-credit computer basics this fall\")"],
    ["result", "“Digital Skills 101: free for residents, Thursdays, register online.”"],
    ["check", "3 options. All free, all this month, all have dates and sign-up info. Goal met."],
    ["answer", "Here's your one-page list ↓"],
  ];

  const TEAM = {
    plan: "This has 3 separate parts. I'll send one subagent to each, in parallel, with the same brief: free, this month, dates, how to sign up.",
    lanes: [
      { name: "Subagent A · libraries", steps: ["web_search(\"library tech help\")", "open_page(events calendar)", "Found: Tech Help, Tue 2–4 pm, drop-in"] },
      { name: "Subagent B · job centers", steps: ["web_search(\"job center computer workshop\")", "open_page(workshops)", "Found: Computer Basics, the 14th, sign up at desk"] },
      { name: "Subagent C · colleges & nonprofits", steps: ["web_search(\"free digital skills class\")", "open_page(course page)", "Found: Digital Skills 101, Thu, register online"] },
    ],
    merge: "All 3 subagents reported back. Removed duplicates, checked every option is free and has a date. Writing the list.",
  };

  const FINAL = [
    ["Public library: Tech Help", "Tuesdays, 2–4 pm · free · just drop in"],
    ["Job center: Computer Basics", "The 14th, 10 am · free · sign up at the front desk"],
    ["Community college: Digital Skills 101", "Thursdays · free for residents · register online"],
  ];

  const LABEL = { think: "THINK", tool: "ACT · tool", result: "RESULT", check: "CHECK", answer: "DONE" };

  function mount(root) {
    let mode = "solo", timers = [], running = false;
    root.innerHTML = `
      <div class="agent-top">
        <div class="toggle" role="tablist">
          <button type="button" class="on" data-m="solo">One agent</button>
          <button type="button" data-m="team">A team of agents</button>
        </div>
        <button type="button" class="btn btn-primary btn-sm" data-play>▶ Run the agent</button>
      </div>
      <div class="window agent-win">
        <div class="window-bar"><div class="lights"><i></i><i></i><i></i></div><div class="window-title">agent run · illustration</div></div>
        <div class="agent-goal"><span class="tag blue">goal</span> ${escapeHTML(GOAL)}</div>
        <div class="agent-body" aria-live="polite"></div>
      </div>
      <p class="agent-note"></p>`;
    const body = root.querySelector(".agent-body"), note = root.querySelector(".agent-note"),
      play = root.querySelector("[data-play]"), tabs = root.querySelector(".toggle");

    const NOTES = {
      solo: "<b>One agent, one loop.</b> It thinks about the next step, uses a tool (search, open a page), looks at the result, and decides again. That loop (reason, act, check) is how almost every agent works. Researchers named it “ReAct” in 2022.",
      team: "<b>Orchestration.</b> A lead agent splits the job and sends subagents to work on each part at the same time, each with its own fresh memory. They report back only what matters, and the lead combines it. Anthropic's Research feature works this way.",
    };

    function later(fn, ms) { timers.push(setTimeout(fn, reduce ? 0 : ms)); }
    function stop() { timers.forEach(clearTimeout); timers = []; running = false; play.textContent = "▶ Run the agent"; }
    function idle() {
      stop();
      body.innerHTML = `<p class="agent-idle">Press <b>▶ Run the agent</b> to watch it work, step by step.</p>`;
      note.innerHTML = NOTES[mode];
    }
    function line(kind, text) {
      body.insertAdjacentHTML("beforeend", `<div class="aline ak-${kind}"><span class="ak">${LABEL[kind] || kind.toUpperCase()}</span><span class="at">${escapeHTML(text)}</span></div>`);
      body.scrollTop = body.scrollHeight;
    }
    function finalList() {
      body.insertAdjacentHTML("beforeend", `<div class="afinal"><b>Free computer classes this month</b><ol>${FINAL.map(([a, b]) => `<li><b>${escapeHTML(a)}</b><br><span>${escapeHTML(b)}</span></li>`).join("")}</ol><small>Illustration. Your agent would give real places and links. Always confirm before you go.</small></div>`);
      body.scrollTop = body.scrollHeight;
      later(() => { running = false; play.textContent = "↺ Run again"; }, 200);
    }
    function runSolo() {
      let t = 200;
      SOLO.forEach(([k, txt]) => { later(() => line(k, txt), t); t += k === "tool" ? 900 : 700; });
      later(finalList, t);
    }
    function runTeam() {
      let t = 200;
      later(() => line("think", "LEAD AGENT: " + TEAM.plan), t); t += 900;
      later(() => {
        body.insertAdjacentHTML("beforeend", `<div class="lanes">${TEAM.lanes.map((l, i) => `
          <div class="lane" data-i="${i}"><div class="lane-h">${escapeHTML(l.name)}</div><div class="lane-b"></div><div class="lane-bar"><i></i></div></div>`).join("")}</div>`);
        body.scrollTop = body.scrollHeight;
      }, t);
      t += 300;
      TEAM.lanes.forEach((l, i) => {
        l.steps.forEach((s, j) => {
          const at = t + j * 800 + i * 220;
          later(() => {
            const lane = body.querySelector(`.lane[data-i="${i}"]`); if (!lane) return;
            lane.querySelector(".lane-b").insertAdjacentHTML("beforeend", `<div class="lstep${j === l.steps.length - 1 ? " found" : ""}">${escapeHTML(s)}</div>`);
            lane.querySelector(".lane-bar i").style.width = ((j + 1) / l.steps.length * 100) + "%";
            if (j === l.steps.length - 1) lane.classList.add("done");
            body.scrollTop = body.scrollHeight;
          }, at);
        });
      });
      t += 800 * 3 + 600;
      later(() => line("check", "LEAD AGENT: " + TEAM.merge), t); t += 900;
      later(finalList, t);
    }
    play.addEventListener("click", () => {
      stop(); body.innerHTML = ""; running = true; play.textContent = "■ Running…";
      note.innerHTML = NOTES[mode];
      (mode === "solo" ? runSolo : runTeam)();
    });
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      mode = b.dataset.m;
      [...tabs.children].forEach((x) => x.classList.toggle("on", x === b));
      idle();
    });
    idle();
  }

  window.AH.mountAgent = mount;
})();
