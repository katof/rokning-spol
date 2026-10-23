// Felags hjálp til Karin Kvant spølini: SVG-element, talubóblan hjá Karin, knøttar og svarmøguleikar á stage'inum,
// stig og uppgávutekstur í høvdinum, og Heim-handshake við hubbin (karin:hello / karin:home).
window.K = (() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function wrap(text, max) {
    const out = []; let line = "";
    for (const w of String(text).split(" ")) {
      if ((line + " " + w).trim().length > max) { out.push(line.trim()); line = w; } else line += " " + w;
    }
    if (line.trim()) out.push(line.trim());
    return out;
  }
  // føroysk tøl: komma sum desimalteknur, bil millum túsundir
  function fmt(n, d = 0) {
    const s = Number(n).toFixed(d).replace(".", ",");
    const [i, f] = s.split(",");
    const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return f ? g + "," + f : g;
  }

  // ---- talubóblan ----
  const bubble = { x: 1215, y: 560, w: 370, max: 30 };
  function setBubble(p) { Object.assign(bubble, p); }
  // brýtur tekstin eftir tí, sum veruliga er pláss fyri í bóbluni (mátar hvørja linju í SVG'inum)
  function wrapMeasured(text, maxW, g) {
    const probe = el("text", { x: -9999, y: -9999 }, g);
    const lines = []; let line = "";
    for (const word of String(text).split(" ")) {
      const t = line ? line + " " + word : word;
      probe.textContent = t;
      if (line && probe.getComputedTextLength() > maxW) { lines.push(line); line = word; } else line = t;
    }
    if (line) lines.push(line);
    probe.remove();
    return lines;
  }
  function say(text) {
    const g = document.getElementById("bubble");
    g.replaceChildren();
    const { x, y, w } = bubble;
    const lines = wrapMeasured(text, w - 36, g);
    const h = 44 + lines.length * 36 + 10;
    el("rect", { x, y, width: w, height: h, rx: 20 }, g);
    el("path", { d: `M${x + 30} ${y + h} L${x + 20} ${y + h + 36} L${x + 70} ${y + h}`, fill: "#fff", stroke: "var(--c)", "stroke-width": 3 }, g);
    el("path", { d: `M${x + 32} ${y + h} H${x + 68}`, stroke: "#fff", "stroke-width": 5 }, g);
    el("text", { class: "who", x: x + 18, y: y + 30 }, g).textContent = "Karin:";
    lines.forEach((l, i) => { el("text", { x: x + 18, y: y + 66 + i * 36 }, g).textContent = l; });
  }

  // ---- høvdið ----
  function task(t) { document.getElementById("task").textContent = t; }
  function score(a, b) { document.getElementById("score").textContent = `${a} / ${b}`; }

  // ---- knøttar á stage'inum (í <g id="actions">) ----
  const actions = () => document.getElementById("actions");
  function clearActions() { actions().replaceChildren(); }
  function button(label, onClick, o = {}) {
    const x = o.x ?? 760, y = o.y ?? 810, w = o.w ?? 280, h = o.h ?? 76;
    const g = el("g", { class: "act", role: "button", "aria-label": label }, o.parent || actions());
    el("rect", { x: x - w / 2, y, width: w, height: h, rx: h / 2 }, g);
    el("text", { x, y: y + h / 2 }, g).textContent = label;
    g.addEventListener("click", onClick);
    return g;
  }
  // ein + ella − knøttur
  function pm(label, x, y, onClick, parent) {
    const g = el("g", { class: "pm", role: "button", "aria-label": label === "+" ? "Meira" : "Minni" }, parent || actions());
    el("rect", { x: x - 40, y: y - 40, width: 80, height: 80, rx: 20 }, g);
    el("text", { x, y: y + 2 }, g).textContent = label;
    g.addEventListener("click", onClick);
    return g;
  }
  function tick(x = 760, y = 848) { el("text", { class: "tick", x, y }, actions()).textContent = "✓"; }
  // svarmøguleikar: opts = [{ label, right }]; onRight/onWrong fáa valið
  function options(opts, o = {}) {
    clearActions();
    const n = opts.length, w = o.w ?? (n <= 2 ? 520 : n === 3 ? 440 : 360), gap = 16, y = o.y ?? 800, h = o.h ?? 84;
    const x0 = 800 - (n * w + (n - 1) * gap) / 2;
    let settled = false;
    opts.forEach((opt, i) => {
      const x = x0 + i * (w + gap);
      const g = el("g", { class: "opt", role: "button", "aria-label": opt.label }, actions());
      el("rect", { x, y, width: w, height: h, rx: 20 }, g);
      const lines = wrap(opt.label, Math.floor(w / 15));
      lines.forEach((l, k) => { el("text", { x: x + w / 2, y: y + h / 2 + (k - (lines.length - 1) / 2) * 30 }, g).textContent = l; });
      g.addEventListener("click", () => {
        if (settled || g.classList.contains("wrong")) return;
        if (opt.right) { settled = true; g.classList.add("right"); o.onRight?.(opt); }
        else { g.classList.add("wrong"); o.onWrong?.(opt); }
      });
    });
  }

  // ---- liðugt ----
  function done(show) { const d = document.getElementById("done"); d.hidden = !show; }

  // ---- Heim og Byrja umaftur ----
  function init(o = {}) {
    if (o.again) document.getElementById("again").addEventListener("click", o.again);
    const d = document.getElementById("done");
    if (d) d.addEventListener("click", () => { d.hidden = true; });
    // Opnað inni í hubbinum: Heim biður hubbin lata spælið aftur, so adressubjálkin vísir framvegis Snar.
    // Opnað fyri seg: leinkjan fer til síðuna hjá hubbinum á Snar (href í HTML).
    let embedded = false;
    const home = document.getElementById("home");
    window.addEventListener("message", ev => {
      const d = ev.data;
      if (d === "karin:hello" || (d && d.type === "karin:hello")) embedded = true;
    });
    home.addEventListener("click", ev => {
      if (!embedded) return;
      ev.preventDefault();
      parent.postMessage("karin:home", "*");
    });
  }

  return { NS, el, rnd, shuffle, wrap, fmt, setBubble, say, task, score, button, pm, tick, options, clearActions, done, init };
})();
