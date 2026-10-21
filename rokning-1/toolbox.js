// Amboð: a toolbox shared by all the Rokning games. Each game loads this file, and it adds a
// toolbox button to the game's header. The tools float on top of the game, so progress is untouched.
(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  let topZ = 1000;

  function h(tag, attrs = {}, parent) {
    const n = document.createElement(tag);
    for (const k in attrs) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(n);
    return n;
  }

  function s(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  h("style", { text: `
    /* the toolbox button makes the header row wider, so let the task text wrap sooner instead of adding a row */
    header .task { flex-basis: 200px; }
    .tbx-btn { display: grid; place-items: center; padding: .3em .45em; align-self: stretch; border: 3px solid #7fae3a;
      border-radius: 999px; background: #fff; color: #24303f; font-size: clamp(16px, 1.5vw, 26px); cursor: pointer; font-family: inherit; }
    .tbx-btn:hover, .tbx-btn[aria-expanded="true"] { background: #f1f7e4; }
    .tbx-btn:focus-visible, .tbx-tile:focus-visible, .tbx-win button:focus-visible, .tbx-pen button:focus-visible { outline: 3px solid #2c3f9e; outline-offset: 2px; }
    .tbx-btn svg { width: 1.25em; height: 1.25em; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .tbx-tray { position: fixed; z-index: 3000; display: grid; grid-template-columns: repeat(4, auto); gap: 10px; padding: 14px;
      background: #fffdf8; border: 3px solid #7fae3a; border-radius: 20px; box-shadow: 0 12px 40px rgba(40, 60, 20, .25); font-family: inherit; }
    .tbx-tile { display: grid; justify-items: center; gap: 4px; min-width: 7.5em; padding: 10px 8px; border: 2px solid #dfe6d3; border-radius: 16px;
      background: #fff; color: #24303f; font: inherit; font-size: clamp(14px, 1.2vw, 20px); font-weight: 700; cursor: pointer; }
    .tbx-tile:hover { background: #f1f7e4; border-color: #7fae3a; }
    .tbx-tile span:first-child { font-size: 2em; line-height: 1; }
    .tbx-win { position: fixed; display: grid; grid-template-rows: auto 1fr; background: #fffdf8; border: 3px solid #2c3f9e; border-radius: 18px;
      box-shadow: 0 14px 44px rgba(20, 30, 60, .3); font-family: inherit; color: #24303f; touch-action: none; max-width: calc(100vw - 24px); }
    .tbx-bar { display: flex; align-items: center; gap: 10px; padding: 6px 8px 6px 16px; background: #2c3f9e; color: #fff; border-radius: 14px 14px 0 0;
      cursor: grab; user-select: none; font-weight: 700; font-size: clamp(16px, 1.3vw, 22px); }
    .tbx-bar span { flex: 1; }
    .tbx-x { width: 2em; height: 2em; border: 0; border-radius: 50%; background: rgba(255, 255, 255, .18); color: #fff; font: inherit; font-size: 1em; cursor: pointer; }
    .tbx-x:hover { background: rgba(255, 255, 255, .35); }
    .tbx-body { padding: 14px; display: grid; gap: 12px; justify-items: center; }
    .tbx-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
    .tbx-win button.tbx-act, .tbx-pen button { font: inherit; font-size: clamp(16px, 1.3vw, 22px); font-weight: 700; padding: .3em .9em; border-radius: 999px;
      border: 3px solid #7fae3a; background: #fff; color: #24303f; cursor: pointer; }
    .tbx-win button.tbx-act:hover, .tbx-pen button:hover { background: #f1f7e4; }
    .tbx-win button.tbx-act[aria-pressed="true"] { background: #7fae3a; color: #fff; }
    .tbx-dice { display: flex; gap: 24px; }
    .tbx-die { width: clamp(110px, 11vw, 190px); aspect-ratio: 1; background: #fff; border: 4px solid #24303f; border-radius: 22%;
      display: grid; grid-template: repeat(3, 1fr) / repeat(3, 1fr); padding: 12%; box-sizing: border-box; }
    .tbx-die i { width: 70%; aspect-ratio: 1; margin: auto; border-radius: 50%; background: #24303f; visibility: hidden; }
    .tbx-die i.on { visibility: visible; }
    .tbx-die.rolling { animation: tbx-shake .12s linear infinite; }
    @keyframes tbx-shake { 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
    .tbx-area { position: relative; width: clamp(360px, 42vw, 760px); height: clamp(220px, 32vh, 420px); background: #f4f8ec;
      border: 2px dashed #b9cf95; border-radius: 14px; overflow: hidden; }
    .tbx-chip { position: absolute; width: clamp(44px, 3.6vw, 64px); aspect-ratio: 1; border-radius: 50%; cursor: grab; touch-action: none;
      box-shadow: inset 0 -5px 0 rgba(0, 0, 0, .18), 0 3px 6px rgba(0, 0, 0, .2); }
    .tbx-red { background: #e23b3b; }
    .tbx-blue { background: #1fb4ea; }
    .tbx-count { font-size: clamp(18px, 1.6vw, 28px); font-weight: 700; min-height: 1.3em; }
    .tbx-frames { display: grid; gap: 14px; }
    .tbx-frame { display: grid; grid-template-columns: repeat(5, clamp(56px, 5vw, 86px)); grid-auto-rows: clamp(56px, 5vw, 86px);
      border: 4px solid #24303f; background: #24303f; gap: 4px; }
    .tbx-cell { background: #fff; border: 0; padding: 0; cursor: pointer; display: grid; place-items: center; }
    .tbx-cell::after { content: ""; width: 72%; aspect-ratio: 1; border-radius: 50%; }
    .tbx-cell.red::after { background: #e23b3b; }
    .tbx-cell.blue::after { background: #1fb4ea; }
    .tbx-line svg { width: clamp(560px, 70vw, 1300px); max-width: calc(100vw - 60px); height: auto; display: block; touch-action: manipulation; }
    .tbx-line .tick { cursor: pointer; }
    .tbx-ruler { position: fixed; touch-action: none; transform-origin: 0 50%; filter: drop-shadow(0 6px 10px rgba(0, 0, 0, .25)); }
    .tbx-ruler svg { display: block; width: clamp(520px, 62vw, 1150px); height: auto; cursor: grab; }
    .tbx-turn { position: absolute; right: -26px; top: 50%; width: 44px; height: 44px; margin-top: -22px; border-radius: 50%; border: 3px solid #2c3f9e;
      background: #fff; color: #2c3f9e; font-size: 22px; display: grid; place-items: center; cursor: grab; touch-action: none; }
    .tbx-rx { position: absolute; left: -16px; top: -16px; width: 36px; height: 36px; border-radius: 50%; border: 0; background: #2c3f9e;
      color: #fff; font-size: 20px; cursor: pointer; }
    .tbx-clock { position: relative; width: clamp(200px, 18vw, 320px); aspect-ratio: 1; }
    .tbx-clock svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .tbx-time { position: absolute; inset: 0; display: grid; place-items: center; font-size: clamp(40px, 4.4vw, 76px); font-weight: 700;
      font-variant-numeric: tabular-nums; }
    .tbx-clock.over .tbx-time { color: #d23a2f; animation: tbx-blink .6s 6; }
    @keyframes tbx-blink { 50% { opacity: .2; } }
    .tbx-canvas { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 900; pointer-events: none; touch-action: none; }
    .tbx-canvas.on { pointer-events: auto; cursor: crosshair; }
    .tbx-pen { position: fixed; z-index: 2500; left: 50%; bottom: max(14px, env(safe-area-inset-bottom, 0px)); transform: translateX(-50%);
      display: flex; gap: 10px; align-items: center; padding: 10px 14px; background: #fffdf8; border: 3px solid #2c3f9e; border-radius: 999px;
      box-shadow: 0 10px 30px rgba(20, 30, 60, .3); font-family: inherit; flex-wrap: wrap; justify-content: center; max-width: calc(100vw - 32px); }
    .tbx-pen .sw { width: 2.2em; height: 2.2em; padding: 0; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 0 0 2px #b8c0c8; }
    .tbx-pen .sw[aria-pressed="true"] { box-shadow: 0 0 0 4px #2c3f9e; }
    .tbx-pen button[aria-pressed="true"]:not(.sw) { background: #7fae3a; color: #fff; }
    @media (prefers-reduced-motion: reduce) { .tbx-die.rolling, .tbx-clock.over .tbx-time { animation: none; } }
  ` }, document.head);

  // ---------- floating windows ----------
  const open = {};

  function front(el) { el.style.zIndex = ++topZ; }

  function drag(handle, target, onMove) {
    handle.addEventListener("pointerdown", ev => {
      if (ev.target.closest("button")) return;
      ev.preventDefault();
      front(target);
      const r = target.getBoundingClientRect(), dx = ev.clientX - r.left, dy = ev.clientY - r.top;
      handle.setPointerCapture(ev.pointerId);
      const move = e => {
        const x = Math.min(Math.max(e.clientX - dx, -r.width + 80), innerWidth - 80);
        const y = Math.min(Math.max(e.clientY - dy, 0), innerHeight - 50);
        if (onMove) onMove(x, y); else { target.style.left = x + "px"; target.style.top = y + "px"; }
      };
      const up = () => { handle.removeEventListener("pointermove", move); handle.removeEventListener("pointerup", up); };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
    });
  }

  function win(id, title, build) {
    if (open[id]) { front(open[id]); return; }
    const w = h("div", { class: "tbx-win", role: "dialog", "aria-label": title }, document.body);
    const bar = h("div", { class: "tbx-bar" }, w);
    h("span", { text: title }, bar);
    const x = h("button", { class: "tbx-x", type: "button", "aria-label": "Lat aftur", title: "Lat aftur", text: "✕" }, bar);
    const body = h("div", { class: "tbx-body" }, w);
    const cleanup = build(body) || (() => {});
    const n = Object.keys(open).length;
    requestAnimationFrame(() => {
      const r = w.getBoundingClientRect();
      w.style.left = Math.max(12, (innerWidth - r.width) / 2 + n * 30) + "px";
      w.style.top = Math.max(12, (innerHeight - r.height) / 2 + n * 30) + "px";
    });
    front(w);
    w.addEventListener("pointerdown", () => front(w));
    drag(bar, w);
    x.addEventListener("click", () => { cleanup(); w.remove(); delete open[id]; });
    open[id] = w;
  }

  function act(parent, label, fn) {
    const b = h("button", { class: "tbx-act", type: "button", text: label }, parent);
    b.addEventListener("click", fn);
    return b;
  }

  // ---------- Terningur ----------
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

  function dice(body) {
    const row = h("div", { class: "tbx-dice" }, body);
    const ctl = h("div", { class: "tbx-row" }, body);
    let count = 1, timer = 0;
    const dies = [];
    function show(d, v) { [...d.children].forEach((p, i) => p.classList.toggle("on", PIPS[v].includes(i))); }
    function layout() {
      row.replaceChildren(); dies.length = 0;
      for (let i = 0; i < count; i++) {
        const d = h("div", { class: "tbx-die", role: "img", "aria-label": "Terningur" }, row);
        for (let k = 0; k < 9; k++) h("i", {}, d);
        show(d, 1 + Math.floor(Math.random() * 6));
        dies.push(d);
      }
    }
    function roll() {
      clearInterval(timer);
      dies.forEach(d => d.classList.add("rolling"));
      let t = 0;
      timer = setInterval(() => {
        dies.forEach(d => show(d, 1 + Math.floor(Math.random() * 6)));
        if (++t > 9) { clearInterval(timer); dies.forEach(d => d.classList.remove("rolling")); }
      }, 70);
    }
    act(ctl, "Kasta", roll);
    const one = act(ctl, "1 terningur", () => { count = 1; one.setAttribute("aria-pressed", "true"); two.setAttribute("aria-pressed", "false"); layout(); });
    const two = act(ctl, "2 terningar", () => { count = 2; two.setAttribute("aria-pressed", "true"); one.setAttribute("aria-pressed", "false"); layout(); });
    one.setAttribute("aria-pressed", "true");
    layout();
    return () => clearInterval(timer);
  }

  // ---------- Brikkar ----------
  function counters(body) {
    const area = h("div", { class: "tbx-area" }, body);
    const count = h("div", { class: "tbx-count", "aria-live": "polite" }, body);
    const ctl = h("div", { class: "tbx-row" }, body);
    let showCount = false;
    function update() {
      const r = area.querySelectorAll(".tbx-red").length, b = area.querySelectorAll(".tbx-blue").length;
      count.textContent = showCount ? `${r} reyðar og ${b} bláar` : "";
    }
    function add(cls) {
      const c = h("div", { class: `tbx-chip ${cls}` }, area);
      const W = area.clientWidth, H = area.clientHeight, size = c.offsetWidth;
      c.style.left = Math.random() * (W - size) + "px";
      c.style.top = Math.random() * (H - size) + "px";
      c.addEventListener("pointerdown", ev => {
        ev.preventDefault(); ev.stopPropagation();
        c.setPointerCapture(ev.pointerId);
        const ar = area.getBoundingClientRect(), cr = c.getBoundingClientRect(), dx = ev.clientX - cr.left, dy = ev.clientY - cr.top;
        area.appendChild(c);
        const move = e => {
          c.style.left = Math.min(Math.max(e.clientX - ar.left - dx, 0), ar.width - cr.width) + "px";
          c.style.top = Math.min(Math.max(e.clientY - ar.top - dy, 0), ar.height - cr.height) + "px";
        };
        const up = () => { c.removeEventListener("pointermove", move); c.removeEventListener("pointerup", up); };
        c.addEventListener("pointermove", move);
        c.addEventListener("pointerup", up);
      });
      update();
    }
    act(ctl, "+ reyð", () => add("tbx-red"));
    act(ctl, "+ blá", () => add("tbx-blue"));
    const shown = act(ctl, "Vís tal", () => { showCount = !showCount; shown.setAttribute("aria-pressed", String(showCount)); update(); });
    shown.setAttribute("aria-pressed", "false");
    act(ctl, "Tøm", () => { area.replaceChildren(); update(); });
  }

  // ---------- Tíggjaraplata ----------
  function tenFrame(body) {
    const frames = h("div", { class: "tbx-frames" }, body);
    const count = h("div", { class: "tbx-count", "aria-live": "polite" }, body);
    const ctl = h("div", { class: "tbx-row" }, body);
    let n = 1, showCount = false;
    function update() {
      const cells = [...frames.querySelectorAll(".tbx-cell")];
      count.textContent = showCount ? String(cells.filter(c => c.className !== "tbx-cell").length) : "";
    }
    function build() {
      frames.replaceChildren();
      for (let f = 0; f < n; f++) {
        const fr = h("div", { class: "tbx-frame" }, frames);
        for (let i = 0; i < 10; i++) {
          const c = h("button", { class: "tbx-cell", type: "button", "aria-label": "Rútur" }, fr);
          // tap: empty → red → blue → empty
          c.addEventListener("click", () => {
            c.className = c.classList.contains("red") ? "tbx-cell blue" : c.classList.contains("blue") ? "tbx-cell" : "tbx-cell red";
            update();
          });
        }
      }
      update();
    }
    const a = act(ctl, "1 plata", () => { n = 1; a.setAttribute("aria-pressed", "true"); b.setAttribute("aria-pressed", "false"); build(); });
    const b = act(ctl, "2 plátur", () => { n = 2; b.setAttribute("aria-pressed", "true"); a.setAttribute("aria-pressed", "false"); build(); });
    a.setAttribute("aria-pressed", "true");
    const shown = act(ctl, "Vís tal", () => { showCount = !showCount; shown.setAttribute("aria-pressed", String(showCount)); update(); });
    shown.setAttribute("aria-pressed", "false");
    act(ctl, "Tøm", build);
    build();
  }

  // ---------- Tallinja ----------
  function numberLine(body) {
    const wrap = h("div", { class: "tbx-line" }, body);
    const ctl = h("div", { class: "tbx-row" }, body);
    let max = 10, pos = 0, svg, frog, arcs;
    const X0 = 60, X1 = 1140, Y = 170;
    const x = n => X0 + (X1 - X0) * n / max;
    function build() {
      wrap.replaceChildren();
      svg = s("svg", { viewBox: "0 0 1200 260", role: "img", "aria-label": `Tallinja 0 til ${max}` }, wrap);
      s("path", { d: `M${X0 - 30} ${Y} H${X1 + 40}`, stroke: "#24303f", "stroke-width": 5 }, svg);
      s("path", { d: `M${X1 + 40} ${Y} l-16 -11 m16 11 l-16 11`, stroke: "#24303f", "stroke-width": 5, fill: "none", "stroke-linecap": "round" }, svg);
      arcs = s("g", {}, svg);
      for (let n = 0; n <= max; n++) {
        const g = s("g", { class: "tick" }, svg);
        s("rect", { x: x(n) - 25, y: Y - 60, width: 50, height: 120, fill: "transparent" }, g);
        s("path", { d: `M${x(n)} ${Y - 16} V${Y + 16}`, stroke: "#24303f", "stroke-width": 4 }, g);
        const t = s("text", { x: x(n), y: Y + 50, "text-anchor": "middle", "font-size": max > 10 ? 30 : 38, "font-weight": 700, fill: "#24303f" }, g);
        t.textContent = n;
        // tapping a number puts the frog there and starts a new jump story
        g.addEventListener("click", () => { pos = n; arcs.replaceChildren(); place(); });
      }
      frog = s("text", { "font-size": 60, "text-anchor": "middle" }, svg);
      frog.textContent = "🐸";
      place();
    }
    function place() { frog.setAttribute("x", x(pos)); frog.setAttribute("y", Y - 22); }
    function jump(d) {
      const to = pos + d;
      if (to < 0 || to > max) return;
      const a = x(pos), b = x(to), up = d > 0, mid = (a + b) / 2, hgt = up ? Y - 120 : Y + 110;
      s("path", { d: `M${a} ${up ? Y - 10 : Y + 10} Q${mid} ${hgt} ${b} ${up ? Y - 10 : Y + 10}`, fill: "none", stroke: up ? "#2c3f9e" : "#d23a2f", "stroke-width": 5, "stroke-linecap": "round" }, arcs);
      pos = to;
      place();
    }
    act(ctl, "− 1", () => jump(-1));
    act(ctl, "+ 1", () => jump(1));
    const ten = act(ctl, "0–10", () => { max = 10; pos = 0; ten.setAttribute("aria-pressed", "true"); twenty.setAttribute("aria-pressed", "false"); build(); });
    const twenty = act(ctl, "0–20", () => { max = 20; pos = 0; twenty.setAttribute("aria-pressed", "true"); ten.setAttribute("aria-pressed", "false"); build(); });
    ten.setAttribute("aria-pressed", "true");
    act(ctl, "Byrja aftur", () => { pos = 0; arcs.replaceChildren(); place(); });
    build();
  }

  // ---------- Linjal ----------
  function ruler() {
    if (open.ruler) { front(open.ruler); return; }
    const r = h("div", { class: "tbx-ruler", role: "img", "aria-label": "Linjal, 0 til 20 cm" }, document.body);
    const svg = s("svg", { viewBox: "0 0 1060 120" }, r);
    s("rect", { x: 2, y: 2, width: 1056, height: 116, rx: 10, fill: "#fff6c9", "fill-opacity": .92, stroke: "#c9a640", "stroke-width": 3 }, svg);
    for (let mm = 0; mm <= 200; mm += 5) {
      const X = 30 + mm * 5, big = mm % 10 === 0;
      s("path", { d: `M${X} 2 V${big ? 44 : 26}`, stroke: "#24303f", "stroke-width": big ? 3 : 2 }, svg);
      if (big) { const t = s("text", { x: X, y: 76, "text-anchor": "middle", "font-size": 30, "font-weight": 700, fill: "#24303f" }, svg); t.textContent = mm / 10; }
    }
    const cm = s("text", { x: 1040, y: 108, "text-anchor": "end", "font-size": 22, fill: "#7a6320" }, svg);
    cm.textContent = "cm";
    const turn = h("div", { class: "tbx-turn", title: "Snara", "aria-label": "Snara linjalin", text: "⟳" }, r);
    const x = h("button", { class: "tbx-rx", type: "button", "aria-label": "Lat aftur", title: "Lat aftur", text: "✕" }, r);
    let angle = 0, left = innerWidth * .2, top = innerHeight * .45;
    const apply = () => { r.style.left = left + "px"; r.style.top = top + "px"; r.style.transform = `rotate(${angle}deg)`; };
    apply();
    front(r);
    drag(svg, r, (nx, ny) => { left = nx; top = ny; apply(); });
    turn.addEventListener("pointerdown", ev => {
      ev.preventDefault(); ev.stopPropagation();
      front(r);
      turn.setPointerCapture(ev.pointerId);
      // the ruler turns around its left end (the 0)
      const ox = left, oy = top + r.offsetHeight / 2;
      const move = e => { angle = Math.atan2(e.clientY - oy, e.clientX - ox) * 180 / Math.PI; apply(); };
      const up = () => { turn.removeEventListener("pointermove", move); turn.removeEventListener("pointerup", up); };
      turn.addEventListener("pointermove", move);
      turn.addEventListener("pointerup", up);
    });
    x.addEventListener("click", () => { r.remove(); delete open.ruler; });
    open.ruler = r;
  }

  // ---------- Tíðarmátari ----------
  function timer(body) {
    const clock = h("div", { class: "tbx-clock" }, body);
    const svg = s("svg", { viewBox: "0 0 120 120" }, clock);
    s("circle", { cx: 60, cy: 60, r: 52, fill: "none", stroke: "#e3e9d8", "stroke-width": 12 }, svg);
    const ring = s("circle", { cx: 60, cy: 60, r: 52, fill: "none", stroke: "#7fae3a", "stroke-width": 12, "stroke-linecap": "round", "stroke-dasharray": 326.7, "stroke-dashoffset": 0 }, svg);
    const time = h("div", { class: "tbx-time", "aria-live": "off" }, clock);
    const msg = h("div", { class: "tbx-count", "aria-live": "assertive" }, body);
    const presets = h("div", { class: "tbx-row" }, body);
    const ctl = h("div", { class: "tbx-row" }, body);
    let total = 120, left = 120, end = 0, tick = 0;
    function draw() {
      const shown = Math.ceil(left);
      time.textContent = `${Math.floor(shown / 60)}:${String(shown % 60).padStart(2, "0")}`;
      ring.setAttribute("stroke-dashoffset", 326.7 * (1 - left / total));
    }
    function beep() {
      try {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        [0, .35, .7].forEach(t => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.frequency.value = 880; o.connect(g); g.connect(ac.destination);
          g.gain.setValueAtTime(.25, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + t + .3);
          o.start(ac.currentTime + t); o.stop(ac.currentTime + t + .3);
        });
      } catch (e) {}
    }
    function stop() { clearInterval(tick); tick = 0; go.textContent = "Byrja"; }
    function set(sec) { stop(); total = left = sec; clock.classList.remove("over"); msg.textContent = ""; draw(); }
    const go = act(ctl, "Byrja", () => {
      if (tick) { left = Math.max(0, (end - Date.now()) / 1000); stop(); return; }
      if (left <= 0) set(total);
      end = Date.now() + left * 1000;
      go.textContent = "Steðga";
      tick = setInterval(() => {
        left = Math.max(0, (end - Date.now()) / 1000);
        draw();
        if (left <= 0) { stop(); clock.classList.add("over"); msg.textContent = "Tíðin er úti!"; beep(); }
      }, 200);
    });
    act(ctl, "Byrja aftur", () => set(total));
    [[30, "½ min"], [60, "1 min"], [120, "2 min"], [180, "3 min"], [300, "5 min"]].forEach(([sec, label]) => act(presets, label, () => set(sec)));
    draw();
    return stop;
  }

  // ---------- Penni ----------
  let canvas, ctx, penBar, penColor = "#2c3f9e", erasing = false;

  function pen() {
    if (!canvas) {
      canvas = h("canvas", { class: "tbx-canvas" }, document.body);
      ctx = canvas.getContext("2d");
      const size = () => {
        const old = document.createElement("canvas");
        old.width = canvas.width; old.height = canvas.height;
        if (canvas.width) old.getContext("2d").drawImage(canvas, 0, 0);
        const dpr = window.devicePixelRatio || 1;
        canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (old.width) ctx.drawImage(old, 0, 0, old.width / dpr, old.height / dpr);
      };
      size();
      addEventListener("resize", size);
      let last = null;
      canvas.addEventListener("pointerdown", ev => { canvas.setPointerCapture(ev.pointerId); last = [ev.clientX, ev.clientY]; dot(ev); });
      canvas.addEventListener("pointermove", ev => {
        if (!last) return;
        ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
        ctx.strokeStyle = penColor; ctx.lineWidth = erasing ? 40 : 7; ctx.lineCap = ctx.lineJoin = "round";
        ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(ev.clientX, ev.clientY); ctx.stroke();
        last = [ev.clientX, ev.clientY];
      });
      const lift = () => { last = null; };
      canvas.addEventListener("pointerup", lift);
      canvas.addEventListener("pointercancel", lift);
      function dot(ev) {
        if (erasing) return;
        ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = penColor;
        ctx.beginPath(); ctx.arc(ev.clientX, ev.clientY, 3.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (penBar) return;
    canvas.classList.add("on");
    penBar = h("div", { class: "tbx-pen", role: "toolbar", "aria-label": "Penni" }, document.body);
    const swatches = [["#2c3f9e", "Blátt"], ["#d23a2f", "Reytt"], ["#3c9a3c", "Grønt"], ["#24303f", "Svart"]].map(([c, name]) => {
      const b = h("button", { class: "sw", type: "button", "aria-label": name, title: name, style: `background:${c}` }, penBar);
      b.addEventListener("click", () => { penColor = c; erasing = false; mark(); });
      return [b, c];
    });
    const rub = h("button", { type: "button", text: "Gummi" }, penBar);
    rub.addEventListener("click", () => { erasing = !erasing; mark(); });
    const clear = h("button", { type: "button", text: "Strika alt" }, penBar);
    clear.addEventListener("click", () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore(); });
    // "Liðugt" leaves the drawing on the screen, but the game can be played again
    const done = h("button", { type: "button", text: "Liðugt" }, penBar);
    done.addEventListener("click", () => { canvas.classList.remove("on"); penBar.remove(); penBar = null; });
    function mark() {
      swatches.forEach(([b, c]) => b.setAttribute("aria-pressed", String(!erasing && c === penColor)));
      rub.setAttribute("aria-pressed", String(erasing));
    }
    mark();
  }

  // ---------- the toolbox button and tray ----------
  const TOOLS = [
    { icon: "✏️", name: "Penni", run: pen },
    { icon: "🎲", name: "Terningur", run: () => win("dice", "Terningur", dice) },
    { icon: "🔴", name: "Brikkar", run: () => win("counters", "Brikkar", counters) },
    { icon: "🔟", name: "Tíggjaraplata", run: () => win("ten", "Tíggjaraplata", tenFrame) },
    { icon: "🐸", name: "Tallinja", run: () => win("line", "Tallinja", numberLine) },
    { icon: "📏", name: "Linjal", run: ruler },
    { icon: "⏱️", name: "Tíðarmátari", run: () => win("timer", "Tíðarmátari", timer) },
  ];

  const tools = document.querySelector("header .tools");
  if (!tools) return;
  const btn = h("button", { class: "tbx-btn", type: "button", "aria-label": "Amboð", title: "Amboð", "aria-expanded": "false",
    html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h18v11H3zM8 9V5h8v4M3 14h18M10 14v2h4v-2"/></svg>' });
  tools.insertBefore(btn, document.getElementById("home") || tools.firstChild);

  let tray = null;
  function closeTray() { tray?.remove(); tray = null; btn.setAttribute("aria-expanded", "false"); }
  btn.addEventListener("click", ev => {
    ev.stopPropagation();
    if (tray) { closeTray(); return; }
    tray = h("div", { class: "tbx-tray", role: "menu", "aria-label": "Amboð" }, document.body);
    TOOLS.forEach(t => {
      const b = h("button", { class: "tbx-tile", type: "button", role: "menuitem", html: `<span aria-hidden="true">${t.icon}</span><span>${t.name}</span>` }, tray);
      b.addEventListener("click", () => { closeTray(); t.run(); });
    });
    const r = btn.getBoundingClientRect(), tr = tray.getBoundingClientRect();
    tray.style.top = r.bottom + 10 + "px";
    tray.style.left = Math.max(12, Math.min(r.right - tr.width, innerWidth - tr.width - 12)) + "px";
    btn.setAttribute("aria-expanded", "true");
    tray.querySelector("button").focus();
  });
  document.addEventListener("pointerdown", ev => { if (tray && !tray.contains(ev.target) && ev.target !== btn && !btn.contains(ev.target)) closeTray(); });
  document.addEventListener("keydown", ev => { if (ev.key === "Escape") closeTray(); });
})();
