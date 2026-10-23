/* lesing.js – felags kota til uppgávusíðurnar í "Mín fyrsta lesing" (Einsamøll við hús)
   Hvør síða er sín egna HTML-fíla. Hesin fílin gevur:
   - toppbjálkan (Heim, fyrra/næsta síða, Strika alt) og sambandið við forsíðuna á Snar
   - sjálvvirkna goymslu í localStorage (lesing/<síða>)
   - uppgávupartarnar: wordbox, janei, xq, lines, fill, pad, match
*/
(function () {
  'use strict';

  // Forsíðan á Snar. Skift hesa slóðina, um fílan fær aðra slóð. (Verður síðan opnað
  // innan í forsíðuni, sendir forsíðan sína egnu slóð, og hon verður brúkt í staðin.)
  const HUB_URL = 'https://snardev.ctrl.fo/fileadmin/user_upload/TEMA_-_KT/Lesing/0_Min_fyrsta_lesing_Einsamoll_vid_hus.html';
  // Myndirnar liggja í img/. Finst ein mynd ikki har, verður hon tikin frá Snar í staðin.
  const SNAR_IMG = 'https://snardev.ctrl.fo/fileadmin/user_upload/TEMA_-_KT/Lesing/';

  const PAGES = [
    { file: 'sidu-02.html',    label: 'Síða 2',        title: 'Set ring um tað, sum er á myndini' },
    { file: 'sidu-03.html',    label: 'Síða 3',        title: 'Set ring um tað rætta' },
    { file: 'sidu-04.html',    label: 'Síða 4',        title: 'Set tað rætta inn – og um teg' },
    { file: 'sidu-04-05.html', label: 'Síða 4 og 5',   title: 'Svara ja ella nei' },
    { file: 'sidu-05.html',    label: 'Síða 5',        title: 'Lita og skriva' },
    { file: 'sidu-06-07.html', label: 'Síða 6 og 7',   title: 'Skriva rætta setningin – mat' },
    { file: 'sidu-07.html',    label: 'Síða 7',        title: 'Skriva rætta setningin – fólkanøvn' },
    { file: 'sidu-07b.html',   label: 'Síða 7 (b)',    title: 'Hygg í kassan – baka og køkur' },
    { file: 'sidu-07c.html',   label: 'Síða 7 (c)',    title: 'Til handils – skriva seðilin' },
    { file: 'sidu-08.html',    label: 'Síða 8',        title: 'Set ring um tað rætta – fuglar' },
    { file: 'sidu-08b.html',   label: 'Síða 8 (b)',    title: 'Skriva við marglittum penni' },
    { file: 'sidu-08c.html',   label: 'Síða 8 (c)',    title: 'Lita myndina' },
    { file: 'sidu-05-09.html', label: 'Síða 5–9',      title: 'Skriva rætta tekstin til myndirnar' },
    { file: 'sidu-12.html',    label: 'Síða 12',       title: 'Finn villurnar' },
    { file: 'sidu-12-13.html', label: 'Síða 12 og 13', title: 'Svara ja ella nei' },
    { file: 'sidu-14-15.html', label: 'Síða 14 og 15', title: 'Villiniborg' },
    { file: 'sidu-16-17.html', label: 'Síða 16 og 17', title: 'Set inn tað rætta – tekna børnini' },
    { file: 'sidu-17-19.html', label: 'Síða 17–19',    title: 'Skriva rætta tekstin til myndirnar' },
    { file: 'sidu-20.html',    label: 'Síða 20',       title: 'Set ring um tað rætta' },
    { file: 'sidu-21.html',    label: 'Síða 21',       title: 'Skriva tekst til myndina' },
  ];

  /* ---------- smáhjálp ---------- */
  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    }
    if (children) for (const c of [].concat(children)) if (c !== null && c !== undefined) n.append(c);
    return n;
  }
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  function resolve(x) { return typeof x === 'string' ? document.querySelector(x) : x; }

  // Samanbering av orðum: smáir bókstavir, ein millumrúm, einki við hvørt tekn ella skiljitekn.
  // Stavingin (á, ð, ø ...) skal vera røtt – tað er lesingin, sum skal venjast.
  function norm(s) {
    return (s || '').toString().normalize('NFC').toLowerCase()
      .replace(/[.,!?;:"'“”‘’«»()\-–—]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function lev(a, b) {
    a = norm(a); b = norm(b);
    const m = []; for (let i = 0; i <= a.length; i++) { m[i] = [i]; }
    for (let j = 0; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    return m[a.length][b.length];
  }
  function mulberry32(a) {
    return function () { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  // Mynd við varaslóð á Snar
  function pic(src, snar, alt) {
    const img = el('img', { src: src, alt: alt || '' });
    if (snar) img.dataset.snar = snar;
    return img;
  }
  document.addEventListener('error', function (e) {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.snar || img.dataset.fell) return;
    img.dataset.fell = '1';
    img.src = SNAR_IMG + img.dataset.snar;
  }, true);
  function sameOrigin(img) {
    try { return new URL(img.currentSrc || img.src, location.href).origin === location.origin; } catch (e) { return false; }
  }

  /* ---------- goymsla ---------- */
  const parts = new Map();
  let loaded = false, saveTimer = null, savedEl = null, savedTimer = null;
  const storageKey = () => 'lesing/' + (document.body.dataset.page || location.pathname.split('/').pop().replace(/\.html$/, ''));

  function register(key, api) { parts.set(key, api); return api; }
  function save() {
    if (!loaded) return;
    clearTimeout(saveTimer); saveTimer = null;
    const data = {};
    parts.forEach((api, k) => { try { data[k] = api.get(); } catch (e) { } });
    try {
      localStorage.setItem(storageKey(), JSON.stringify({ v: 1, t: Date.now(), parts: data }));
      if (savedEl) { savedEl.classList.add('on'); clearTimeout(savedTimer); savedTimer = setTimeout(() => savedEl.classList.remove('on'), 1400); }
    } catch (e) { }
  }
  function touch() { if (!loaded) return; clearTimeout(saveTimer); saveTimer = setTimeout(save, 600); }
  function load() {
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(storageKey())); } catch (e) { }
    if (raw && raw.parts) parts.forEach((api, k) => { if (k in raw.parts) { try { api.set(raw.parts[k]); } catch (e) { } } });
    loaded = true;
  }
  function clearAll() {
    parts.forEach(api => { try { api.reset && api.reset(); } catch (e) { } });
    try { localStorage.removeItem(storageKey()); } catch (e) { }
  }

  // Leys skrivifelt (input/textarea uttan fyri uppgávupartarnar) verða goymd eftir raðfylgju.
  function registerFree() {
    const fields = $$('input, textarea').filter(f => !f.closest('[data-ls-owned]') && !f.closest('.ls-top') && f.type !== 'range' && f.type !== 'button');
    if (!fields.length) return;
    register('free', {
      get: () => fields.map(f => (f.type === 'checkbox' || f.type === 'radio') ? !!f.checked : f.value),
      set: v => { if (!Array.isArray(v)) return; fields.forEach((f, i) => { if (i >= v.length) return; if (f.type === 'checkbox' || f.type === 'radio') f.checked = !!v[i]; else f.value = v[i] == null ? '' : v[i]; f.dispatchEvent(new Event('ls-restore')); }); },
      reset: () => fields.forEach(f => { if (f.type === 'checkbox' || f.type === 'radio') f.checked = false; else f.value = ''; f.classList.remove('ok', 'bad'); const sl = f.closest('.slot'); if (sl) sl.classList.remove('ok', 'bad'); })
    });
  }

  /* ---------- ja/nei spurnargluggi ---------- */
  function confirm(message, yes, no) {
    return new Promise(resolve => {
      const wrap = el('div', { class: 'ls-modal', role: 'dialog', 'aria-modal': 'true' });
      const bNei = el('button', { class: 'btn', type: 'button', text: no || 'Nei' });
      const bJa = el('button', { class: 'btn primary', type: 'button', text: yes || 'Ja' });
      wrap.append(el('div', { class: 'box' }, [el('div', { class: 'msg', text: message }), el('div', { class: 'row' }, [bNei, bJa])]));
      document.body.appendChild(wrap);
      const done = v => { wrap.remove(); document.removeEventListener('keydown', onKey); resolve(v); };
      const onKey = ev => { if (ev.key === 'Escape') done(false); };
      bJa.addEventListener('click', () => done(true));
      bNei.addEventListener('click', () => done(false));
      wrap.addEventListener('click', ev => { if (ev.target === wrap) done(false); });
      document.addEventListener('keydown', onKey);
      bNei.focus();
    });
  }

  /* ---------- toppbjálki + samband við forsíðuna ---------- */
  let embedded = false, hubUrl = HUB_URL, homeLink = null;
  window.addEventListener('message', ev => {
    const d = ev.data;
    if (d === 'lesing:hello' || (d && d.type === 'lesing:hello')) {
      embedded = true;
      if (d && d.hub) hubUrl = d.hub;
      if (homeLink) homeLink.href = hubUrl;
    }
  });

  function buildHeader() {
    const body = document.body;
    const file = location.pathname.split('/').pop() || '';
    const idx = PAGES.findIndex(p => p.file === file || p.file === body.dataset.page + '.html');
    const page = idx >= 0 ? PAGES[idx] : null;
    const top = el('header', { class: 'ls-top' });

    homeLink = el('a', { class: 'btn ls-home', href: hubUrl, title: 'Heim til forsíðuna',
      html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 12 3l9 8M5 10v11h5v-6h4v6h5V10"/></svg><span>Heim</span>' });
    homeLink.addEventListener('click', ev => {
      if (!embedded) return;
      ev.preventDefault();
      save();
      parent.postMessage('lesing:home', '*');
    });
    top.appendChild(homeLink);

    const nav = el('nav', { class: 'ls-nav', 'aria-label': 'Síður' });
    const prev = idx > 0 ? PAGES[idx - 1] : null, next = idx >= 0 && idx < PAGES.length - 1 ? PAGES[idx + 1] : null;
    nav.append(
      el('a', { class: 'btn', href: prev ? prev.file : '#', 'aria-disabled': prev ? null : 'true', title: prev ? prev.label + ': ' + prev.title : '', text: '◀', 'aria-label': 'Fyrra síða' }),
      el('a', { class: 'btn', href: next ? next.file : '#', 'aria-disabled': next ? null : 'true', title: next ? next.label + ': ' + next.title : '', text: '▶', 'aria-label': 'Næsta síða' }));
    top.appendChild(nav);
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => save()));

    top.appendChild(el('span', { class: 'ls-brand', text: 'Mín fyrsta lesing' }));
    if (page) top.appendChild(el('span', { class: 'ls-page', text: '· ' + page.label }));

    savedEl = el('span', { class: 'ls-saved', text: 'Goymt ✓', 'aria-live': 'polite' });
    top.appendChild(savedEl);

    const erase = el('button', { class: 'btn danger ls-erase', type: 'button', text: 'Strika alt', title: 'Strika alt á hesi síðuni' });
    erase.addEventListener('click', async () => {
      if (await confirm('Skal alt á hesi síðuni strikast?', 'Ja, strika', 'Nei')) clearAll();
    });
    top.appendChild(erase);

    body.prepend(top);
  }

  /* ---------- knappar ---------- */
  function buttons(root, spec) {
    root = resolve(root); root.classList.add('actions');
    const out = {};
    if (spec.kanna) out.kanna = root.appendChild(el('button', { class: 'btn primary', type: 'button', text: 'Kanna', onclick: spec.kanna }));
    if (spec.angra) out.angra = root.appendChild(el('button', { class: 'btn', type: 'button', text: 'Angra', onclick: spec.angra }));
    if (spec.vis) out.vis = root.appendChild(el('button', { class: 'btn', type: 'button', text: 'Vís svarið', onclick: spec.vis }));
    if (spec.rudda) out.rudda = root.appendChild(el('button', { class: 'btn', type: 'button', text: 'Rudda', onclick: spec.rudda }));
    if (spec.result) out.result = root.parentElement.insertBefore(el('div', { class: 'result', 'aria-live': 'polite' }), root.nextSibling);
    return out;
  }
  function setResult(node, text, ok) {
    if (!node) return;
    node.textContent = text || '';
    node.classList.toggle('ok', ok === true);
    node.classList.toggle('bad', ok === false);
  }

  /* ---------- Set ring um orðini ---------- */
  function wordbox(root, o) {
    root = resolve(root);
    root.classList.add('wordgrid'); root.setAttribute('data-ls-owned', '');
    const correct = new Set(o.correct.map(norm));
    const btns = o.words.map(w => root.appendChild(el('button', { type: 'button', class: 'word', 'aria-pressed': 'false', text: w })));
    let resultEl = null;
    const pressed = () => btns.filter(b => b.getAttribute('aria-pressed') === 'true');
    root.addEventListener('click', e => {
      const b = e.target.closest('.word'); if (!b) return;
      const on = b.getAttribute('aria-pressed') === 'true';
      if (!on && o.max && pressed().length >= o.max) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return; }
      b.setAttribute('aria-pressed', String(!on));
      b.classList.remove('ok', 'bad');
      setResult(resultEl, '');
      touch();
    });
    function check() {
      let right = 0, wrong = 0;
      btns.forEach(b => {
        b.classList.remove('ok', 'bad');
        if (b.getAttribute('aria-pressed') !== 'true') return;
        if (correct.has(norm(b.textContent))) { b.classList.add('ok'); right++; } else { b.classList.add('bad'); wrong++; }
      });
      const total = o.correct.length, all = right === total && wrong === 0;
      setResult(resultEl, all ? 'Rætt! Øll ' + total + ' orðini eru funnin ✓' : 'Rætt: ' + right + ' av ' + total + (wrong ? ' – ' + wrong + (wrong === 1 ? ' er skeivt' : ' eru skeiv') : ''), all);
      touch();
      return all;
    }
    function reset() { btns.forEach(b => { b.setAttribute('aria-pressed', 'false'); b.classList.remove('ok', 'bad'); }); setResult(resultEl, ''); }
    const api = {
      root, check, reset,
      get: () => ({ on: btns.map(b => b.getAttribute('aria-pressed') === 'true'), mark: btns.map(b => b.classList.contains('ok') ? 1 : b.classList.contains('bad') ? 2 : 0) }),
      set: s => { if (!s || !s.on) return; btns.forEach((b, i) => { b.setAttribute('aria-pressed', String(!!s.on[i])); b.classList.toggle('ok', s.mark && s.mark[i] === 1); b.classList.toggle('bad', s.mark && s.mark[i] === 2); }); }
    };
    if (o.actions !== false) {
      const act = root.parentElement.insertBefore(el('div'), root.nextSibling);
      resultEl = buttons(act, { kanna: check, rudda: reset, result: true }).result;
    }
    api.setResultEl = n => { resultEl = n; };
    return register(o.key || root.id || 'wordbox' + parts.size, api);
  }

  /* ---------- Skrivilinjur við rættum svørum ---------- */
  function lines(root, o) {
    root = resolve(root);
    root.classList.add('linegrid'); root.setAttribute('data-ls-owned', '');
    const answers = (o.answers || []).map(norm);
    const count = o.count || answers.length;
    const inputs = [];
    for (let i = 0; i < count; i++) {
      const inp = el('input', { class: 'line', type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: o.placeholder || '', 'aria-label': 'Orð ' + (i + 1) });
      const sugg = el('div', { class: 'sugg' });
      root.appendChild(el('div', { class: 'linewrap' }, [inp, sugg]));
      inp.addEventListener('input', () => { inp.classList.remove('ok', 'bad'); sugg.innerHTML = ''; setResult(resultEl, ''); touch(); });
      inputs.push(inp);
    }
    let resultEl = null;
    function check() {
      const used = new Set();
      let right = 0;
      inputs.forEach(inp => {
        const sugg = inp.nextElementSibling; sugg.innerHTML = '';
        inp.classList.remove('ok', 'bad');
        const v = norm(inp.value); if (!v) return;
        if (answers.includes(v) && !used.has(v)) { used.add(v); inp.classList.add('ok'); right++; return; }
        inp.classList.add('bad');
        if (o.suggest !== false) {
          let best = null, score = 1e9;
          answers.forEach(a => { if (used.has(a)) return; const d = lev(v, a); if (d < score) { score = d; best = a; } });
          if (best && score <= Math.max(2, Math.ceil(best.length / 2))) {
            const pill = el('button', { type: 'button', class: 'pill', text: best, title: 'Set hetta orðið inn' });
            pill.addEventListener('click', () => { inp.value = best; check(); inp.focus(); });
            sugg.appendChild(pill);
          }
        }
      });
      const all = right === answers.length;
      setResult(resultEl, all ? 'Øll ' + answers.length + ' orðini eru skrivað rætt ✓' : 'Skrivað rætt: ' + right + ' av ' + answers.length, all);
      touch();
      return all;
    }
    function reset() { inputs.forEach(i => { i.value = ''; i.classList.remove('ok', 'bad'); i.nextElementSibling.innerHTML = ''; }); setResult(resultEl, ''); }
    const api = {
      root, check, reset, inputs,
      get: () => inputs.map(i => i.value),
      set: v => { if (Array.isArray(v)) inputs.forEach((i, k) => { i.value = v[k] || ''; }); }
    };
    if (o.actions !== false) {
      const act = root.parentElement.insertBefore(el('div'), root.nextSibling);
      resultEl = buttons(act, { kanna: check, rudda: reset, result: true }).result;
    }
    api.setResultEl = n => { resultEl = n; };
    return register(o.key || root.id || 'lines' + parts.size, api);
  }

  /* ---------- Fyllifelt: input[data-answer] í einum øki ---------- */
  function fill(root, o) {
    root = resolve(root); o = o || {};
    root.setAttribute('data-ls-owned', '');
    const inputs = $$('input[data-answer]', root);
    const markEl = inp => inp.closest('.slot') || inp;
    inputs.forEach(inp => inp.addEventListener('input', () => { markEl(inp).classList.remove('ok', 'bad'); setResult(resultEl, ''); touch(); }));
    let resultEl = null;
    function check() {
      let right = 0;
      inputs.forEach(inp => {
        const m = markEl(inp); m.classList.remove('ok', 'bad');
        if (!inp.value.trim()) return;
        const ok = inp.dataset.answer.split('|').map(norm).includes(norm(inp.value));
        m.classList.add(ok ? 'ok' : 'bad'); if (ok) right++;
      });
      const all = right === inputs.length;
      setResult(resultEl, all ? 'Alt er rætt ✓' : 'Rætt: ' + right + ' av ' + inputs.length, all);
      touch();
      return all;
    }
    function reset() { inputs.forEach(inp => { inp.value = ''; markEl(inp).classList.remove('ok', 'bad'); }); setResult(resultEl, ''); }
    const api = { root, check, reset, get: () => inputs.map(i => i.value), set: v => { if (Array.isArray(v)) inputs.forEach((i, k) => { i.value = v[k] || ''; }); } };
    if (o.actions) { resultEl = buttons(resolve(o.actions), { kanna: check, rudda: reset, result: true }).result; }
    return register(o.key || root.id || 'fill' + parts.size, api);
  }

  /* ---------- Set x við tað rætta ---------- */
  let xqCount = 0;
  function xq(root, o) {
    root = resolve(root);
    root.classList.add('xq'); root.setAttribute('data-ls-owned', '');
    const name = 'xq' + (++xqCount);
    const type = o.type === 'checkbox' ? 'checkbox' : 'radio';
    const correct = new Set([].concat(o.correct).map(norm));
    if (o.text) root.appendChild(el('span', { class: 'q', text: o.text }));
    const inputs = o.options.map(opt => {
      const v = typeof opt === 'string' ? opt : opt.v, label = typeof opt === 'string' ? opt : opt.label;
      const inp = el('input', { type, name, value: v });
      root.appendChild(el('label', {}, [inp, el('span', { text: label })]));
      return inp;
    });
    const res = root.appendChild(el('span', { class: 'result inline', 'aria-live': 'polite' }));
    function evaluate() {
      const chosen = inputs.filter(i => i.checked).map(i => norm(i.value));
      if (!chosen.length) { setResult(res, ''); return null; }
      const ok = chosen.length === correct.size && chosen.every(c => correct.has(c));
      setResult(res, ok ? '✓ Rætt!' : '✗ Royn aftur', ok);
      return ok;
    }
    inputs.forEach(i => i.addEventListener('change', () => { evaluate(); touch(); }));
    function reset() { inputs.forEach(i => { i.checked = false; }); setResult(res, ''); }
    const api = { root, reset, check: evaluate, get: () => inputs.map(i => i.checked), set: v => { if (Array.isArray(v)) { inputs.forEach((i, k) => { i.checked = !!v[k]; }); evaluate(); } } };
    return register(o.key || root.id || name, api);
  }

  /* ---------- Svara ja ella nei – bókstavirnir gera orð ---------- */
  function janei(root, o) {
    root = resolve(root);
    root.classList.add('jn'); root.setAttribute('data-ls-owned', '');
    const rows = o.rows; // [tekstur, bókstavur, 'ja'|'nei']
    const typed = o.mode === 'type';
    const table = el('div', { class: 'jn-table' + (o.cols === 2 ? ' cols2' : '') });
    const cols = o.cols === 2 ? [el('div', { class: 'jn-col' }), el('div', { class: 'jn-col' })] : [el('div', { class: 'jn-col' })];
    cols.forEach(c => table.appendChild(c));
    const half = Math.ceil(rows.length / 2);
    const rowEls = rows.map((r, i) => {
      const line = el('div', { class: 'jn-row' });
      line.appendChild(el('span', { text: r[0] }));
      if (typed) {
        line.appendChild(el('input', { class: 'jn-type', type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: 'ja / nei', 'aria-label': r[0] }));
      } else {
        line.appendChild(el('div', { class: 'jn-choice' }, [
          el('button', { type: 'button', class: 'ring ja', 'aria-pressed': 'false', text: 'ja' }),
          el('button', { type: 'button', class: 'ring nei', 'aria-pressed': 'false', text: 'nei' })]));
      }
      line.appendChild(el('span', { class: 'jn-letter', text: r[1] }));
      (o.cols === 2 && i >= half ? cols[1] : cols[0]).appendChild(line);
      return line;
    });
    root.appendChild(table);

    const wordsEl = el('div', { class: 'jn-words' });
    const slotsJa = el('span', { class: 'jn-slots' }), slotsNei = el('span', { class: 'jn-slots' });
    const resJa = el('span', { class: 'result inline' }), resNei = el('span', { class: 'result inline' });
    wordsEl.append(
      el('div', { class: 'jn-word' }, [el('span', { class: 'jn-tag', text: 'Bókstavir (ja):' }), slotsJa, resJa]),
      el('div', { class: 'jn-word' }, [el('span', { class: 'jn-tag', text: 'Bókstavir (nei):' }), slotsNei, resNei]));
    (o.result ? resolve(o.result) : root).appendChild(wordsEl);

    const value = i => typed ? norm($('.jn-type', rowEls[i]).value) : ($('.ring[aria-pressed="true"]', rowEls[i]) || {}).textContent || '';
    function setRing(i, v) {
      $('.ring.ja', rowEls[i]).setAttribute('aria-pressed', String(v === 'ja'));
      $('.ring.nei', rowEls[i]).setAttribute('aria-pressed', String(v === 'nei'));
      $$('.ring', rowEls[i]).forEach(b => b.classList.remove('ok', 'bad'));
    }
    function collect() {
      const ja = [], nei = [];
      rows.forEach((r, i) => { const v = value(i); if (v === 'ja') ja.push(r[1]); else if (v === 'nei') nei.push(r[1]); });
      return { ja, nei };
    }
    function renderSlots(box, letters, target) {
      box.innerHTML = '';
      const n = Math.max(target.length, letters.length);
      for (let i = 0; i < n; i++) box.appendChild(el('span', { class: 'jn-slot' + (i >= target.length ? ' extra' : ''), text: letters[i] || '' }));
    }
    function update() {
      const c = collect();
      renderSlots(slotsJa, c.ja, o.ja); renderSlots(slotsNei, c.nei, o.nei);
      setResult(resJa, ''); setResult(resNei, '');
    }
    const history = [];
    table.addEventListener('click', e => {
      const b = e.target.closest('.ring'); if (!b) return;
      const line = b.closest('.jn-row'), i = rowEls.indexOf(line);
      const want = b.classList.contains('ja') ? 'ja' : 'nei';
      const prev = value(i);
      history.push({ i, prev });
      setRing(i, prev === want ? '' : want);
      update(); touch();
    });
    if (typed) table.addEventListener('input', e => { if (e.target.classList.contains('jn-type')) { e.target.classList.remove('ok', 'bad'); update(); touch(); } });

    function check() {
      const c = collect();
      const okJa = norm(c.ja.join('')) === norm(o.ja), okNei = norm(c.nei.join('')) === norm(o.nei);
      setResult(resJa, okJa ? '✓ ' + o.ja : '✗ royn aftur', okJa);
      setResult(resNei, okNei ? '✓ ' + o.nei : '✗ royn aftur', okNei);
      rows.forEach((r, i) => {
        const v = value(i); if (!v) return;
        const ok = v === r[2];
        if (typed) { const inp = $('.jn-type', rowEls[i]); inp.classList.toggle('ok', ok); inp.classList.toggle('bad', !ok); }
        else { const b = $('.ring[aria-pressed="true"]', rowEls[i]); if (b) { b.classList.toggle('ok', ok); b.classList.toggle('bad', !ok); } }
      });
      touch();
      return okJa && okNei;
    }
    function undo() {
      const last = history.pop(); if (!last) return;
      setRing(last.i, last.prev); update(); touch();
    }
    function reset() {
      rows.forEach((r, i) => { if (typed) { const inp = $('.jn-type', rowEls[i]); inp.value = ''; inp.classList.remove('ok', 'bad'); } else setRing(i, ''); });
      history.length = 0; update();
    }
    update();
    const api = {
      root, check, reset, undo,
      get: () => rows.map((r, i) => typed ? $('.jn-type', rowEls[i]).value : value(i)),
      set: v => { if (!Array.isArray(v)) return; rows.forEach((r, i) => { if (typed) $('.jn-type', rowEls[i]).value = v[i] || ''; else setRing(i, v[i] || ''); }); update(); }
    };
    if (o.actions !== false) {
      const act = root.appendChild(el('div'));
      buttons(act, typed ? { kanna: check, rudda: reset } : { kanna: check, angra: undo, rudda: reset });
    }
    return register(o.key || root.id || 'janei' + parts.size, api);
  }

  /* ---------- Teikni- og litiflatan ---------- */
  const TOOL_NAMES = {
    pen: '✏️ Pennur', marker: '🖊️ Tussj', crayon: '🖍️ Oljukrit', chalk: '🖍️ Krit', dots: '• • • Prikkar',
    rainbow: '🌈 Ælabogi', spray: '🌟 Ymisk skap', confetti: '🎉 Konfetti', snow: '❄️ Kavi', eraser: '🩹 Viskileður', x: '✖ Set X'
  };
  const GUIDE_NAMES = { none: 'Tómt pappír', lines: 'Linjur', dots: 'Prikkar' };

  function pad(root, o) {
    root = resolve(root);
    o = Object.assign({ tools: ['pen'], colors: [{ hex: '#111111', name: 'svart' }], size: { min: 2, max: 60, value: 10 }, undo: true, clear: true, save: null, guides: null, image: null, height: 520, key: null }, o);
    root.classList.add('pad'); root.setAttribute('data-ls-owned', '');
    const colors = o.colors.map(c => typeof c === 'string' ? { hex: c, name: c } : c);
    let tool = o.tool || o.tools[0], color = o.color || colors[0].hex, size = o.size ? o.size.value : (o.sizeValue || 8), guide = o.guide || (o.guides ? o.guides[0] : 'none');

    // amboðsbjálki
    const bar = el('div', { class: 'pad-tools' });
    let toolBtns = [], swatches = [], guideBtns = [];
    if (o.tools.length > 1) {
      toolBtns = o.tools.map(t => bar.appendChild(el('button', { type: 'button', class: 'tool', 'data-tool': t, 'aria-pressed': String(t === tool), text: TOOL_NAMES[t] || t })));
      bar.addEventListener('click', e => { const b = e.target.closest('.tool[data-tool]'); if (!b) return; tool = b.dataset.tool; toolBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
      bar.appendChild(el('span', { class: 'sep' }));
    }
    if (colors.length > 1) {
      const sw = el('div', { class: 'swatches', role: 'radiogroup', 'aria-label': 'Litir' });
      swatches = colors.map(c => sw.appendChild(el('button', { type: 'button', class: 'swatch', role: 'radio', 'data-color': c.hex, 'aria-checked': String(c.hex === color), title: c.name, 'aria-label': c.name, style: 'background:' + c.hex })));
      sw.addEventListener('click', e => { const b = e.target.closest('.swatch'); if (!b) return; color = b.dataset.color; swatches.forEach(x => x.setAttribute('aria-checked', String(x === b))); });
      bar.appendChild(sw);
      bar.appendChild(el('span', { class: 'sep' }));
    }
    if (o.size) {
      const range = el('input', { type: 'range', min: o.size.min, max: o.size.max, value: o.size.value, 'aria-label': 'Stødd' });
      range.addEventListener('input', () => { size = +range.value; });
      bar.appendChild(el('label', {}, [el('span', { text: 'Stødd' }), range]));
    }
    if (o.guides) {
      bar.appendChild(el('span', { class: 'sep' }));
      bar.appendChild(el('span', { class: 'hint', text: 'Hjálpilinjur:' }));
      guideBtns = o.guides.map(g => bar.appendChild(el('button', { type: 'button', class: 'tool', 'data-guide': g, 'aria-pressed': String(g === guide), text: GUIDE_NAMES[g] || g })));
      bar.addEventListener('click', e => { const b = e.target.closest('.tool[data-guide]'); if (!b) return; setGuide(b.dataset.guide); touch(); });
    }
    const right = el('span', { style: 'margin-left:auto; display:inline-flex; gap:8px; flex-wrap:wrap' });
    let undoBtn = null, clearBtn = null, saveBtn = null;
    if (o.undo) undoBtn = right.appendChild(el('button', { type: 'button', class: 'btn', text: 'Angra' }));
    if (o.clear) clearBtn = right.appendChild(el('button', { type: 'button', class: 'btn', text: o.clearLabel || 'Rudda' }));
    if (o.save) saveBtn = right.appendChild(el('button', { type: 'button', class: 'btn', text: 'Goym sum mynd' }));
    bar.appendChild(right);
    root.appendChild(bar);

    // flatan
    const stage = el('div', { class: 'pad-stage' });
    let img = null;
    if (o.image) {
      img = pic(o.image.src, o.image.snar, o.image.alt || '');
      stage.appendChild(img);
      if (saveBtn) { const chk = () => { saveBtn.hidden = !sameOrigin(img); }; img.addEventListener('load', chk); if (img.complete) chk(); }
    } else {
      stage.style.height = 'min(' + o.height + 'px, 72vh)';
      stage.style.minHeight = '220px';
    }
    const canvas = el('canvas', { 'aria-label': o.label || 'Teikniflata' });
    stage.appendChild(canvas);
    root.appendChild(stage);
    const ctx = canvas.getContext('2d');
    function setGuide(g) { guide = g; stage.classList.toggle('g-lines', g === 'lines'); stage.classList.toggle('g-dots', g === 'dots'); guideBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.guide === g))); }
    setGuide(guide);

    // strikumodell: {t: amboð, c: litur, s: stødd/breidd, seed, p: [[x,y]...] (0..1)}
    let strokes = [];
    const active = new Map();
    let W = 1, H = 1, dpr = 1;

    function resize() {
      const r = stage.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      W = r.width; H = r.height; dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    }
    new ResizeObserver(resize).observe(stage);
    window.addEventListener('load', resize);

    const px = p => ({ x: p[0] * W, y: p[1] * H });
    function normPos(e) {
      const r = canvas.getBoundingClientRect();
      return [Math.min(1, Math.max(0, (e.clientX - r.left) / Math.max(1, r.width))), Math.min(1, Math.max(0, (e.clientY - r.top) / Math.max(1, r.height)))];
    }
    const hue = h => 'hsl(' + (((h % 360) + 360) % 360) + ', 92%, 45%)';
    const palette = () => colors.length > 1 ? colors.map(c => c.hex) : ['#d32f2f', '#1976d2', '#2e7d32', '#f9a825', '#7b1fa2', '#ff6f00', '#00acc1', '#c2185b'];

    function line(c, a, b, w, col, alpha, erase) {
      c.save();
      c.globalAlpha = alpha == null ? 1 : alpha; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = w; c.strokeStyle = col;
      c.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      c.restore();
    }
    function dot(c, x, y, r, col, alpha) { c.save(); c.globalAlpha = alpha == null ? 1 : alpha; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.restore(); }

    // Teknar eitt brot av eini striku. i er talið á brotinum, so slembitølini verða tey somu, tá alt verður teknað umaftur.
    function segment(c, s, a, b, i, lenBefore) {
      const w = Math.max(1, s.s * W);
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const rng = mulberry32((s.seed + i * 7919) | 0);
      switch (s.t) {
        case 'pen': line(c, a, b, w, s.c); break;
        case 'marker': line(c, a, b, w * 1.8, s.c, 0.28); break;
        case 'eraser': line(c, a, b, w * 1.6, '#000', 1, true); break;
        case 'rainbow': line(c, a, b, w, hue(s.seed % 360 + (lenBefore + d) * 0.7)); break;
        case 'crayon': {
          line(c, a, b, w * 0.9, s.c, 0.5);
          const steps = Math.max(3, Math.floor(d / 2));
          for (let k = 0; k < steps; k++) { const t = k / steps; dot(c, a.x + (b.x - a.x) * t + (rng() - .5) * w * .6, a.y + (b.y - a.y) * t + (rng() - .5) * w * .6, w * .18 + rng() * w * .22, s.c, 0.25 + rng() * 0.25); }
          break;
        }
        case 'chalk': {
          line(c, a, b, w * 1.1, s.c, 0.28);
          const grains = Math.max(3, Math.floor(d * 0.6));
          for (let k = 0; k < grains; k++) { const t = k / grains; dot(c, a.x + (b.x - a.x) * t + (rng() - .5) * w * .6, a.y + (b.y - a.y) * t + (rng() - .5) * w * .6, Math.max(.6, w * .06 + rng() * w * .08), s.c, 0.18); }
          line(c, a, b, Math.max(1, w * 0.6), s.c, 0.35);
          break;
        }
        case 'dots': {
          const sp = Math.max(4, w * 0.9), L = d || 0.0001;
          let k = Math.floor(lenBefore / sp) + 1; if (lenBefore === 0 && d === 0) k = 0;
          for (let t = k * sp - lenBefore; t <= L; t += sp) dot(c, a.x + (b.x - a.x) * t / L, a.y + (b.y - a.y) * t / L, w * 0.45, s.c, 0.95);
          break;
        }
        case 'spray': case 'confetti': case 'snow': {
          const n = Math.max(5, Math.floor(d / 3)), pal = palette();
          for (let k = 0; k < n; k++) {
            const t = k / Math.max(1, n - 1), x = a.x + (b.x - a.x) * t + (rng() - .5) * w * 2, y = a.y + (b.y - a.y) * t + (rng() - .5) * w * 2;
            c.save(); c.translate(x, y); c.globalAlpha = .92;
            if (s.t === 'snow') { c.fillStyle = '#bfe0ff'; c.beginPath(); c.arc(0, 0, Math.max(1.2, w * .35), 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, Math.max(.6, w * .17), 0, Math.PI * 2); c.fill(); }
            else if (s.t === 'confetti') { c.rotate(rng() * Math.PI); c.fillStyle = pal[Math.floor(rng() * pal.length)]; const r = Math.max(1.5, w * .45); c.fillRect(-r, -r * .6, 2 * r, 1.2 * r); }
            else {
              const pick = rng(), r = Math.max(1.5, w * .45); c.fillStyle = pal[Math.floor(rng() * pal.length)];
              if (pick < .33) { c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); }
              else if (pick < .66) { c.rotate(rng() * Math.PI); c.fillRect(-r, -r, 2 * r, 2 * r); }
              else { c.beginPath(); for (let q = 0; q < 10; q++) { const ang = q * Math.PI / 5 - Math.PI / 2, rad = q % 2 ? r * .5 : r * 1.1; c.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad); } c.closePath(); c.fill(); }
            }
            c.restore();
          }
          break;
        }
        case 'x': {
          const h = w / 2;
          c.save(); c.strokeStyle = s.c; c.lineCap = 'round'; c.lineWidth = Math.max(3, w * 0.12);
          c.beginPath(); c.moveTo(a.x - h, a.y - h); c.lineTo(a.x + h, a.y + h); c.moveTo(a.x - h, a.y + h); c.lineTo(a.x + h, a.y - h); c.stroke();
          c.restore();
          break;
        }
      }
    }
    function drawStroke(c, s) {
      if (!s.p.length) return;
      let a = px(s.p[0]), len = 0;
      segment(c, s, a, a, 0, 0);
      for (let i = 1; i < s.p.length; i++) { const b = px(s.p[i]); segment(c, s, a, b, i, len); len += Math.hypot(b.x - a.x, b.y - a.y); a = b; }
      s._len = len;
    }
    function redraw() { ctx.clearRect(0, 0, W, H); strokes.forEach(s => drawStroke(ctx, s)); }

    canvas.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { }
      const p = normPos(e);
      const s = { t: tool, c: color, s: size / W, seed: Math.floor(Math.random() * 2e9), p: [p], _len: 0 };
      strokes.push(s);
      segment(ctx, s, px(p), px(p), 0, 0);
      if (tool === 'x') { touch(); return; }
      active.set(e.pointerId, s);
    });
    canvas.addEventListener('pointermove', e => {
      const s = active.get(e.pointerId); if (!s) return;
      const p = normPos(e), a = px(s.p[s.p.length - 1]), b = px(p);
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      if (d < 1.2) return;
      s.p.push([+p[0].toFixed(4), +p[1].toFixed(4)]);
      segment(ctx, s, a, b, s.p.length - 1, s._len);
      s._len += d;
    });
    const end = e => { if (active.delete(e.pointerId)) touch(); };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);

    function undo() {
      for (let i = strokes.length - 1; i >= 0; i--) { if (![...active.values()].includes(strokes[i])) { strokes.splice(i, 1); break; } }
      redraw(); touch();
    }
    function clear() { strokes = []; active.clear(); redraw(); touch(); }
    function exportPNG() {
      const scale = 2, out = document.createElement('canvas');
      out.width = Math.round(W * scale); out.height = Math.round(H * scale);
      const c = out.getContext('2d'); c.scale(scale, scale);
      c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
      if (guide === 'lines') { c.strokeStyle = '#e3e7ec'; c.lineWidth = 2; for (let y = 47; y < H; y += 48) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
      if (guide === 'dots') { c.fillStyle = '#d9dee6'; for (let y = 12; y < H; y += 24) for (let x = 12; x < W; x += 24) { c.beginPath(); c.arc(x, y, 1.3, 0, Math.PI * 2); c.fill(); } }
      try {
        if (img && img.complete && img.naturalWidth) c.drawImage(img, 0, 0, W, H);
        c.drawImage(canvas, 0, 0, W, H);
        const a = document.createElement('a'); a.download = o.save; a.href = out.toDataURL('image/png'); a.click();
      } catch (err) { alert('Myndin kann ikki goymast her.'); }
    }
    if (undoBtn) undoBtn.addEventListener('click', undo);
    if (clearBtn) clearBtn.addEventListener('click', clear);
    if (saveBtn) saveBtn.addEventListener('click', exportPNG);

    const api = {
      root, canvas, undo, clear, reset: () => { strokes = []; active.clear(); if (o.guides) setGuide(o.guide || o.guides[0]); redraw(); }, exportPNG,
      get: () => ({ strokes: strokes.map(s => ({ t: s.t, c: s.c, s: s.s, seed: s.seed, p: s.p })), guide }),
      set: v => { if (!v) return; if (Array.isArray(v.strokes)) strokes = v.strokes.map(s => Object.assign({ _len: 0 }, s)); if (v.guide && o.guides) setGuide(v.guide); redraw(); }
    };
    return register(o.key || root.id || 'pad' + parts.size, api);
  }

  /* ---------- Flyt setningin til røttu myndina ---------- */
  function match(root, o) {
    root = resolve(root); root.setAttribute('data-ls-owned', '');
    const grid = el('div', { class: 'mt-grid' });
    const drops = new Map(), lineInputs = new Map();
    o.cards.forEach(c => {
      const card = el('div', { class: 'mt-card', 'data-key': c.key });
      card.appendChild(el('div', { class: 'mt-img' }, pic(c.img, c.snar, c.alt)));
      const drop = el('div', { class: 'drop', 'data-key': c.key, 'aria-label': 'Set setningin her' });
      card.appendChild(drop); drops.set(c.key, drop);
      if (o.typed) {
        const inp = el('input', { class: 'line', type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: 'Skriva setningin her …', 'aria-label': 'Skriva setningin til myndina' });
        inp.addEventListener('input', () => { inp.classList.remove('ok', 'bad'); setResult(resultEl, ''); touch(); });
        card.appendChild(inp); lineInputs.set(c.key, inp);
      }
      grid.appendChild(card);
    });
    root.appendChild(grid);
    const bank = el('div', { class: 'bank', 'aria-label': 'Setningar' });
    const chips = o.chips.map(ch => bank.appendChild(el('div', { class: 'chip', 'data-key': ch.key, tabindex: '0', role: 'button', text: ch.text })));
    root.appendChild(el('div', { class: 'bank-wrap' }, [el('div', { class: 'bank-title', text: o.bankTitle || 'Setningar' }), bank]));
    const act = root.appendChild(el('div'));
    const resultEl = buttons(act, Object.assign({ kanna: check, rudda: reset, result: true }, o.reveal ? { vis: reveal } : {})).result;

    function clearMarks() { drops.forEach(d => d.classList.remove('right', 'wrong')); lineInputs.forEach(i => i.classList.remove('ok', 'bad')); setResult(resultEl, ''); }
    function place(chip, drop) {
      const existing = drop.querySelector('.chip');
      if (existing && existing !== chip) bank.appendChild(existing);
      const from = chip.parentElement;
      drop.appendChild(chip); drop.classList.add('filled');
      if (from && from.classList.contains('drop') && from !== drop) from.classList.remove('filled');
      clearMarks(); touch();
    }
    function toBank(chip) {
      const from = chip.parentElement;
      bank.appendChild(chip);
      if (from && from.classList.contains('drop')) from.classList.remove('filled');
      clearMarks(); touch();
    }
    let selected = null;
    function select(chip) { if (selected) selected.classList.remove('sel'); selected = chip; if (chip) chip.classList.add('sel'); drops.forEach(d => d.classList.toggle('target', !!chip)); }

    // Draga (mús, fingur, pennur) – ella trýsta á setning og síðan á mynd
    let drag = null;
    root.addEventListener('pointerdown', e => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      e.preventDefault();
      const r = chip.getBoundingClientRect();
      drag = { chip, x0: e.clientX, y0: e.clientY, offX: e.clientX - r.left, offY: e.clientY - r.top, w: r.width, h: r.height, moving: false, from: chip.parentElement };
      try { chip.setPointerCapture(e.pointerId); } catch (err) { }
    });
    root.addEventListener('pointermove', e => {
      if (!drag) return;
      if (!drag.moving) { if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return; drag.moving = true; select(null); drag.chip.classList.add('dragging'); drag.chip.style.width = drag.w + 'px'; drag.chip.style.height = drag.h + 'px'; }
      drag.chip.style.left = (e.clientX - drag.offX) + 'px'; drag.chip.style.top = (e.clientY - drag.offY) + 'px';
      const over = dropAt(e.clientX, e.clientY);
      drops.forEach(d => d.classList.toggle('hover', d === over));
    });
    function endDrag(e) {
      if (!drag) return;
      const d = drag; drag = null;
      if (d.moving) {
        d.chip.classList.remove('dragging'); d.chip.style.cssText = '';
        drops.forEach(x => x.classList.remove('hover'));
        const target = dropAt(e.clientX, e.clientY);
        if (target) place(d.chip, target);
        else if (bankAt(e.clientX, e.clientY) || !d.from.classList.contains('drop')) toBank(d.chip);
        else d.from.appendChild(d.chip);
      } else {
        select(selected === d.chip ? null : d.chip);
      }
    }
    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);
    root.addEventListener('click', e => {
      if (!selected || e.target.closest('.chip')) return;
      const drop = e.target.closest('.drop');
      if (drop) { const c = selected; select(null); place(c, drop); return; }
      if (e.target.closest('.bank')) { const c = selected; select(null); toBank(c); }
    });
    root.addEventListener('keydown', e => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(selected === chip ? null : chip); }
    });
    function dropAt(x, y) { for (const d of drops.values()) { const r = d.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return d; } return null; }
    function bankAt(x, y) { const r = bank.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }

    function check() {
      let right = 0, total = drops.size;
      drops.forEach((d, key) => { const chip = d.querySelector('.chip'); const ok = !!chip && chip.dataset.key === key; d.classList.toggle('right', ok); d.classList.toggle('wrong', !ok); if (ok) right++; });
      let typedRight = 0;
      if (o.typed) lineInputs.forEach((inp, key) => { if (!inp.value.trim()) return; const ok = norm(inp.value) === norm(o.typed[key]); inp.classList.toggle('ok', ok); inp.classList.toggle('bad', !ok); if (ok) typedRight++; });
      const all = right === total && (!o.typed || typedRight === total);
      setResult(resultEl, (all ? 'Alt er rætt ✓ ' : '') + 'Myndir: ' + right + ' av ' + total + (o.typed ? ' – Skrivað rætt: ' + typedRight + ' av ' + total : ''), all);
      touch();
      return all;
    }
    function reset() { select(null); chips.forEach(c => bank.appendChild(c)); drops.forEach(d => d.classList.remove('filled')); lineInputs.forEach(i => { i.value = ''; }); clearMarks(); }
    function reveal() { select(null); drops.forEach((d, key) => { const chip = chips.find(c => c.dataset.key === key); if (chip) { d.appendChild(chip); d.classList.add('filled'); } }); if (o.typed) lineInputs.forEach((i, key) => { i.value = o.typed[key]; }); clearMarks(); touch(); }

    const api = {
      root, check, reset, reveal,
      get: () => { const placed = {}; drops.forEach((d, key) => { const c = d.querySelector('.chip'); if (c) placed[key] = c.dataset.key; }); const typed = {}; lineInputs.forEach((i, key) => { typed[key] = i.value; }); return { placed, typed }; },
      set: v => { if (!v) return; reset(); if (v.placed) Object.entries(v.placed).forEach(([key, ck]) => { const d = drops.get(key), c = chips.find(x => x.dataset.key === ck); if (d && c) { d.appendChild(c); d.classList.add('filled'); } }); if (v.typed) Object.entries(v.typed).forEach(([key, t]) => { const i = lineInputs.get(key); if (i) i.value = t || ''; }); }
    };
    return register(o.key || root.id || 'match' + parts.size, api);
  }

  /* ---------- byrjan ---------- */
  function init() {
    if (!document.body.dataset.page) return; // forsíðan brúkar ikki toppbjálkan
    buildHeader();
    registerFree();
    load();
    document.addEventListener('input', touch);
    document.addEventListener('change', touch);
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.Lesing = { PAGES, HUB_URL, SNAR_IMG, el, norm, lev, pic, confirm, buttons, setResult, register, touch, save, wordbox, lines, fill, xq, janei, pad, match };
})();
