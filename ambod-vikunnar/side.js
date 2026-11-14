/* Amboðið hesa vikuna: savnssíðan. Snar heintar hesa fílu frá GitHub (sí LÍM INN – síða.html).
   Teksturin á síðuni stendur her, og amboðini standa í stubbar.json við somu mappu.
   Royna ein annan dag: legg ?dagur=2026-11-16 aftrat slóðini. */
(function () {
  var root = document.getElementById('snar-ambod');
  if (!root) return;
  var me = document.currentScript && document.currentScript.src;
  var BASE = me ? me.replace(/[^\/]*$/, '') : 'https://katof.github.io/rokning-spol/ambod-vikunnar/';
  var DATA_URL = BASE + 'stubbar.json';

  if (!document.querySelector('link[href*="family=Inter"]')) {
    var f = document.createElement('link');
    f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(f);
  }

  root.className = 'av';
  root.innerHTML =
    '<header class="av-hero"><div class="av-wrap">' +
      '<p class="av-kick">Nýtt hvønn mánadag</p>' +
      '<h1>Amboðið hesa vikuna</h1>' +
      '<p class="av-lead">Hvørja viku vísir Snar á eitt hent amboð á netinum, sum kann nýtast í undirvísingini – við einum hugskoti, ið kann roynast í flokkinum beinanvegin.</p>' +
      '<p class="av-rules"><span>Ókeypis at nýta</span><span>Eingin innritan hjá næmingum</span><span>Roynt, áðrenn tað kemur við</span></p>' +
    '</div></header>' +
    '<main class="av-wrap av-main">' +
      '<div id="av-next"></div>' +
      '<div class="av-filter" id="av-filter"></div>' +
      '<div id="av-list" aria-live="polite"><p class="av-empty">Amboðini verða lisin inn …</p></div>' +
      '<p class="av-foot">Amboðini eru ikki gjørd av Snar, og tey kunnu broytast. Við hvørt amboð stendur, nær tað seinast varð kannað. Veitst tú um eitt gott amboð, so skriva til snar@snar.fo.</p>' +
    '</main>';

  var $ = function (s) { return root.querySelector(s); };
  var MAN = ['januar','februar','mars','apríl','mai','juni','juli','august','september','oktober','november','desember'];
  var VIK = ['sunnudagin','mánadagin','týsdagin','mikudagin','hósdagin','fríggjadagin','leygardagin'];
  function date(s) { var a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
  function fmt(d) { return d.getDate() + '. ' + MAN[d.getMonth()] + ' ' + d.getFullYear(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  var q = new URLSearchParams(location.search).get('dagur');
  var today = q ? date(q) : new Date();
  today.setHours(0, 0, 0, 0);
  var out = [], next = null, fd = '', fg = '';

  function chips() {
    var deild = ['Grunddeild','Miðdeild','Hádeild'].filter(function (d) { return out.some(function (s) { return s.deild.indexOf(d) >= 0; }); });
    var grein = [];
    out.forEach(function (s) { s.grein.forEach(function (g) { if (grein.indexOf(g) < 0) grein.push(g); }); });
    grein.sort(function (a, b) { return a.localeCompare(b, 'fo'); });
    function c(k, v, l) { return '<button type="button" class="av-chip" data-k="' + k + '" data-v="' + esc(v) + '" aria-pressed="' + ((k === 'd' ? fd : fg) === v ? 'true' : 'false') + '">' + esc(l) + '</button>'; }
    $('#av-filter').innerHTML = '<b>Deild</b>' + c('d', '', 'Allar') + deild.map(function (d) { return c('d', d, d); }).join('') +
      '<span class="av-sep"></span><b>Lærugrein</b>' + c('g', '', 'Allar') + grein.map(function (g) { return c('g', g, g); }).join('');
  }
  /* Kortini hava id "av-k-N", men leinkjan er #ambod-N: Snar tekur sjálvt yvir trýst á #leinkjur, sum vísa á eitt id á síðuni. */
  function card(s, isNew) {
    return '<article class="av-card' + (isNew ? ' new' : '') + '" data-c="' + esc(s.c) + '" id="av-k-' + s.nr + '"><div class="av-l">' +
      '<div class="av-meta">' + (isNew ? '<span class="av-new">NÝTT</span>' : '') + '<span>Nr. ' + s.nr + ' · ' + fmt(date(s.d)) + '</span></div>' +
      '<h2>' + esc(s.heiti) + '</h2><p class="av-under">' + esc(s.undir) + '</p><p class="av-stutt">' + esc(s.stutt) + '</p>' +
      '<div class="av-tags">' + s.deild.map(function (d) { return '<span>' + esc(d) + '</span>'; }).join('') + s.grein.map(function (g) { return '<span class="g">' + esc(g) + '</span>'; }).join('') + '</div>' +
      '<a class="av-go" href="' + esc(s.url) + '" target="_blank" rel="noopener">Lat amboðið upp ↗</a>' +
      '<p class="av-hvor">Frá ' + esc(s.hvor) + ' · Kannað ' + fmt(date(s.kannad)) + '</p></div>' +
      '<div class="av-r"><h3>Royn í flokkinum</h3><p>' + esc(s.royn) + '</p><h3>Gott at vita</h3><ul>' + s.vita.map(function (v) { return '<li>' + esc(v) + '</li>'; }).join('') + '</ul></div></article>';
  }
  function render() {
    chips();
    var list = out.filter(function (s) { return (!fd || s.deild.indexOf(fd) >= 0) && (!fg || s.grein.indexOf(fg) >= 0); }).reverse();
    var newest = out.length ? out[out.length - 1].nr : 0;
    $('#av-list').innerHTML = list.length ? list.map(function (s) { return card(s, s.nr === newest); }).join('') : '<p class="av-empty">Einki amboð var at finna. Royn eitt annað val.</p>';
    $('#av-next').innerHTML = next ? '<div class="av-next"><b>Næsta amboð kemur ' + VIK[date(next.d).getDay()] + ' ' + date(next.d).getDate() + '. ' + MAN[date(next.d).getMonth()] + '</b><span>' + out.length + ' amboð í savninum higartil</span></div>' : '';
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('.av-chip');
    if (!b) return;
    if (b.dataset.k === 'd') fd = b.dataset.v; else fg = b.dataset.v;
    render();
  });
  fetch(DATA_URL, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (all) {
    all.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
    out = all.filter(function (s) { return date(s.d) <= today; });
    next = all.filter(function (s) { return date(s.d) > today; })[0] || null;
    render();
    var m = location.hash.match(/^#ambod-(\d+)$/);
    if (m) {
      var el = document.getElementById('av-k-' + m[1]);
      /* bíða eftir, at síðan og skriftirnar eru lisnar, annars lendir rullingin skeivt */
      if (el) setTimeout(function () { window.scrollTo(0, el.getBoundingClientRect().top + window.pageYOffset - 100); }, 400);
    }
  }).catch(function () { $('#av-list').innerHTML = '<p class="av-empty">Amboðini kundu ikki lesast inn. Royn aftur seinni.</p>'; });
})();
