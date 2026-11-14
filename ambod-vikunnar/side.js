/* Amboðið hesa vikuna: savnssíðan. Snar heintar hesa fílu frá GitHub (sí LÍM INN – síða.html).
   Teksturin á síðuni stendur her, og amboðini standa í stubbar.json við somu mappu.
   Royna ein annan dag: legg ?dagur=2026-11-16 aftrat slóðini. */
(function () {
  var root = document.getElementById('snar-ambod');
  if (!root) return;
  var me = document.currentScript && document.currentScript.src;
  var BASE = me ? me.replace(/[^\/]*$/, '') : 'https://katof.github.io/rokning-spol/ambod-vikunnar/';
  var DATA_URL = BASE + 'stubbar.json';
  var SNAR = 'https://snar.fo';
  var LOGO = SNAR + '/fileadmin/user_upload/TEMA_-_KT/Logo_Snar/SnarLogoRed.png';

  if (!document.querySelector('link[href*="family=Inter"]')) {
    var f = document.createElement('link');
    f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(f);
  }

  /* Smáar strikumyndir til amboðini. "ikon" í stubbar.json velur eina; uttan ikon verður skrúvulykilin brúktur. */
  var IKON = {
    kort: '<path d="M6 12 18 7l12 5 12-5v30l-12 5-12-5-12 5z"/><path d="M18 7v30M30 12v30"/><circle cx="36" cy="22" r="3.2" class="f"/>',
    stjornur: '<path d="M8 34 17 22l10 6 13-16"/><circle cx="8" cy="34" r="2.6" class="f"/><circle cx="17" cy="22" r="2.6" class="f"/><circle cx="27" cy="28" r="2.6" class="f"/><circle cx="40" cy="12" r="2.6" class="f"/><path d="M33 38v6M30 41h6M12 8v4M10 10h4"/>',
    form: '<path d="M6 40 24 22v18z"/><path d="M24 22h16v16H24z" transform="rotate(0)"/><path d="M8 8h18l-8 10H0z" transform="translate(6 2)"/>',
    skrua: '<path d="M30 6a10 10 0 0 0-9 14L7 34a4 4 0 0 0 6 6l14-14a10 10 0 0 0 14-9l-6 6-6-2-2-6z"/>'
  };
  function ikon(k, cls) { return '<svg class="' + (cls || 'av-ico') + '" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' + (IKON[k] || IKON.skrua) + '</svg>'; }

  /* Strikumyndin í høvdinum, í sama stíli sum tekningarnar á forsíðuni hjá Snar */
  var HERO_SVG =
    '<svg class="av-art" viewBox="0 0 520 300" aria-hidden="true" focusable="false">' +
      '<g class="ln">' +
        '<path d="M20 262h480"/>' +
        '<rect x="120" y="92" width="250" height="150" rx="6"/>' +
        '<path d="M100 262l20-20h250l20 20"/>' +
        '<path d="M120 116h250"/>' +
        '<circle cx="136" cy="104" r="3"/><circle cx="148" cy="104" r="3"/><circle cx="160" cy="104" r="3"/>' +
        '<rect x="176" y="98" width="150" height="12" rx="6"/>' +
        '<path d="M150 150h70M150 166h50M150 182h60"/>' +
        '<path d="M262 206 286 172l20 14 26-38"/>' +
        '<path d="M410 262V150l38-12v124"/>' +
        '<path d="M410 170h10M410 190h16M410 210h10M410 230h16M410 250h10"/>' +
        '<circle cx="62" cy="214" r="22"/><path d="M78 230l18 18"/>' +
      '</g>' +
      '<circle cx="262" cy="206" r="5" class="rd"/><circle cx="286" cy="172" r="5" class="bl"/><circle cx="306" cy="186" r="5" class="rd"/><circle cx="332" cy="148" r="5" class="bl"/>' +
      '<path class="rdl" d="M150 214h40"/>' +
      '<path class="trail" d="M380 70c30-20 60-30 90-26"/>' +
      '<path class="bll" d="M470 34l24 10-24 10 6-10z"/>' +
      '<circle cx="470" cy="256" r="6" class="rd"/>' +
    '</svg>';

  /* Síðufóturin. Temasavn 2 hevur ikki Snar-síðufótin, so síðan hevur sín egna:
     sama innihald sum á snar.fo, men við málistokki, strikumyndum av amboðum og standandi hundinum í svørtum. */
  var FOOTER =
    '<footer class="av-ft" aria-label="Snar">' +
      '<div class="av-ft-ruler" aria-hidden="true"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span></div>' +
      '<div class="av-ft-art" aria-hidden="true">' +
        ikon('kort', 'av-ft-i a1') + ikon('stjornur', 'av-ft-i a2') + ikon('form', 'av-ft-i a3') + ikon('skrua', 'av-ft-i a4') +
        '<svg class="av-ft-i a5" viewBox="0 0 48 48"><circle cx="20" cy="20" r="12"/><path d="M29 29l12 12"/></svg>' +
        '<svg class="av-ft-plane" viewBox="0 0 260 60"><path class="t" d="M4 50c60-30 140-44 220-34"/><path class="p" d="M226 6l26 12-26 10 7-11z"/></svg>' +
      '</div>' +
      '<div class="av-wrap av-ft-main">' +
        '<div class="av-ft-brand"><p class="av-ft-eye">Undirvísingarportalur</p>' +
          '<a class="av-ft-word" href="' + SNAR + '/forsidan" aria-label="Snar – forsíða">Sna<span>r.</span></a>' +
          '<p>Tilfar, hugskot og amboð til læring og undirvísing.</p></div>' +
        '<nav class="av-ft-col" aria-label="Finn tilfar"><h2>Finn tilfar</h2><ul>' +
          '<li><a class="av-fl" href="' + SNAR + '/temasavn">Temasavn</a></li><li><a class="av-fl" href="' + SNAR + '/skjol">Skjøl</a></li><li><a class="av-fl" href="' + SNAR + '/funkur">Funkur</a></li>' +
          '<li><a class="av-fl" href="' + SNAR + '/ambodid-hesa-vikuna">Amboðið hesa vikuna</a></li></ul></nav>' +
        '<nav class="av-ft-col" aria-label="Snar"><h2>Snar</h2><ul>' +
          '<li><a class="av-fl" href="' + SNAR + '/um-snar">Um Snar</a></li><li><a class="av-fl" href="' + SNAR + '/forsidan">Forsíðan</a></li><li><a class="av-fl" href="mailto:snar@snar.fo">Skriva til okkara</a></li></ul></nav>' +
        '<div class="av-ft-col"><h2>Samband &amp; miðlar</h2><address>Nám · Hoyvíksvegur 72<br>100 Tórshavn<br><a class="av-fl" href="mailto:snar@snar.fo">snar@snar.fo</a></address>' +
          '<a class="av-fl av-ft-fb" href="https://www.facebook.com/SnarUndirvisingarsida/" target="_blank" rel="noopener noreferrer">Facebook ↗</a></div>' +
      '</div>' +
      '<div class="av-ft-bottom"><div class="av-wrap av-ft-bottom-in"><p>© Snar · Útgivið av Námi</p>' +
        '<button class="av-dog" type="button" aria-label="Vekja Snar">' +
          '<span class="av-zzz" aria-hidden="true"><i>z</i><i>z</i><i>Z</i></span><span class="av-woof" aria-hidden="true">VUFF!</span>' +
          '<svg viewBox="0 8 104 48" aria-hidden="true" focusable="false"><g class="av-dog-s">' +
            '<path class="legs-back" d="M38 38h4v12h-4zm-2 10h8v4h-8zM62 38h4v12h-4zm0 10h8v4h-8z"/>' +
            '<g class="body">' +
              '<path d="M28 38h6v14h-6zm-4 12h12v4H24zM54 38h6v14h-6zm0 12h12v4H54z"/>' +
              '<g class="tail"><path d="M24 28h8v12h-8zm-4-4h6v10h-6zm-4-6h6v10h-6zm-2-4h4v8h-4z"/></g>' +
              '<path d="M30 26h32v18H30zm-4 4h8v10h-8zm12-6h22v6H38zm22-4h10v24H60z"/>' +
              '<path d="M66 10h12v4H66zm-4 4h20v20H62zm16 8h12v12H78zm10 0h4v6h-4z"/>' +
              '<path d="M60 12h6v18h-6zm-2 4h4v10h-4z"/>' +
            '</g>' +
            '<path class="eye-shut" d="M73 18h6v2h-6z"/><path class="eye-open" d="M74 16h4v4h-4z"/>' +
            '<path class="mouth" d="M82 30h8v2h-8z"/><path class="collar" d="M62 30h10v4H62z"/>' +
            '<circle class="mball" cx="95" cy="32" r="6"/><circle class="gball" cx="97" cy="49" r="5"/>' +
          '</g></svg></button>' +
      '</div></div>' +
    '</footer>';

  var onSnar = !!document.querySelector('.snar2026-topbar');
  root.className = 'av';
  root.innerHTML =
    (onSnar ? '' :
    '<nav class="av-top" aria-label="Snar"><div class="av-wrap av-top-in">' +
      '<a class="av-logo" href="' + SNAR + '/" aria-label="Snar forsíða"><img src="' + LOGO + '" alt="Snar"></a>' +
    '</div></nav>') +
    '<header class="av-hero"><div class="av-wrap av-hero-in"><div class="av-hero-t">' +
      '<a class="av-back" href="' + SNAR + '/">← Snar</a>' +
      '<span class="av-bar" aria-hidden="true"></span>' +
      '<h1>Amboðið hesa vikuna</h1>' +
      '<p class="av-lead">Hvønn mánadag vísir Snar á eitt hent amboð á netinum – við einum hugskoti, sum kann roynast í flokkinum beinanvegin.</p>' +
      '<ul class="av-rules"><li>Ókeypis at nýta</li><li>Eingin innritan hjá næmingum</li><li>Roynt, áðrenn tað kemur við</li></ul>' +
    '</div>' + HERO_SVG + '</div></header>' +
    '<main class="av-wrap av-main">' +
      '<section aria-labelledby="av-h-now"><div class="av-sec-h"><h2 id="av-h-now">Hesa vikuna</h2><span id="av-week"></span></div>' +
        '<div id="av-feature"><p class="av-empty">Amboðini verða lisin inn …</p></div><div id="av-next"></div></section>' +
      '<section id="av-old" aria-labelledby="av-h-old" hidden><div class="av-sec-h"><h2 id="av-h-old">Amboð frá undanfarnum vikum</h2><span id="av-n"></span></div>' +
        '<div class="av-filter" id="av-filter" hidden></div><div class="av-grid" id="av-grid"></div></section>' +
      '<section class="av-tip"><div><h2>Veitst tú um eitt gott amboð?</h2><p>Skriva til okkara, so royna vit tað og kanska vísa á tað ein mánadag.</p></div>' +
        '<div class="av-tip-b"><a class="av-btn" href="mailto:snar@snar.fo?subject=Amboðið%20hesa%20vikuna">Skriva til Snar</a><a class="av-btn ghost" href="' + SNAR + '/">← Aftur til Snar</a></div></section>' +
    '</main>' +
    FOOTER +
    '<dialog class="av-dlg" id="av-dlg" aria-labelledby="av-dlg-h"></dialog>';

  var $ = function (s) { return root.querySelector(s); };
  var MAN = ['januar','februar','mars','apríl','mai','juni','juli','august','september','oktober','november','desember'];
  var VIK = ['sunnudagin','mánadagin','týsdagin','mikudagin','hósdagin','fríggjadagin','leygardagin'];
  function date(s) { var a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
  function fmt(d, y) { return d.getDate() + '. ' + MAN[d.getMonth()] + (y === false ? '' : ' ' + d.getFullYear()); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function host(u) { try { return new URL(u).host.replace(/^www\./, ''); } catch (e) { return ''; } }
  function vika(d) {
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n);
    return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
  }
  var q = new URLSearchParams(location.search).get('dagur');
  var today = q ? date(q) : new Date();
  today.setHours(0, 0, 0, 0);
  var out = [], next = null, fd = '', fg = '';

  function tags(s) {
    return '<div class="av-tags">' + s.deild.map(function (d) { return '<span>' + esc(d) + '</span>'; }).join('') +
      s.grein.map(function (g) { return '<span class="g">' + esc(g) + '</span>'; }).join('') + '</div>';
  }
  function detail(s, isNew, hid) {
    return '<div class="av-card-top">' +
        '<div class="av-browser" aria-hidden="true"><div class="av-b-bar"><i></i><i></i><i></i><span>' + esc(host(s.url)) + '</span></div>' +
          '<div class="av-b-body">' + ikon(s.ikon, 'av-ico big') + '<b>' + esc(s.heiti) + '</b></div></div>' +
        '<div class="av-card-t">' +
          '<p class="av-meta">' + (isNew ? '<span class="av-new">NÝTT</span>' : '') + '<span>Nr. ' + s.nr + ' · ' + fmt(date(s.d)) + '</span></p>' +
          '<h3' + (hid ? ' id="' + hid + '"' : '') + '>' + esc(s.heiti) + '</h3><p class="av-under">' + esc(s.undir) + '</p>' +
          '<p class="av-stutt">' + esc(s.stutt) + '</p>' + tags(s) +
          '<a class="av-go" href="' + esc(s.url) + '" target="_blank" rel="noopener">Lat amboðið upp ↗</a>' +
          '<p class="av-hvor">Frá ' + esc(s.hvor) + ' · Kannað ' + fmt(date(s.kannad)) + '</p>' +
        '</div></div>' +
      '<div class="av-card-b">' +
        '<div class="av-royn"><h4>Royn í flokkinum</h4><p>' + esc(s.royn) + '</p></div>' +
        '<div class="av-vita"><h4>Gott at vita</h4><ul>' + s.vita.map(function (v) { return '<li>' + esc(v) + '</li>'; }).join('') + '</ul></div>' +
      '</div>';
  }
  function feature() {
    if (!out.length) {
      $('#av-feature').innerHTML = '<p class="av-empty">Fyrsta amboðið kemur ' + (next ? VIK[date(next.d).getDay()] + ' ' + fmt(date(next.d), false) : 'skjótt') + '.</p>';
      return;
    }
    var s = out[out.length - 1], d = date(s.d), e = new Date(d); e.setDate(e.getDate() + 6);
    $('#av-week').textContent = 'Vika ' + vika(d) + ' · ' + d.getDate() + '.' + (d.getMonth() === e.getMonth() ? '' : ' ' + MAN[d.getMonth()]) + '–' + fmt(e, false);
    $('#av-feature').innerHTML = '<article class="av-card" data-c="' + esc(s.c) + '" id="av-k-' + s.nr + '">' + detail(s, true) + '</article>';
    $('#av-next').innerHTML = next ? '<p class="av-next"><span class="av-next-l">Næsta amboð</span>kemur ' + VIK[date(next.d).getDay()] + ' ' + fmt(date(next.d), false) + '</p>' : '';
  }
  function chips(old) {
    var box = $('#av-filter');
    if (old.length < 6) { box.hidden = true; return; }
    var deild = ['Grunddeild','Miðdeild','Hádeild'].filter(function (d) { return old.some(function (s) { return s.deild.indexOf(d) >= 0; }); });
    var grein = [];
    old.forEach(function (s) { s.grein.forEach(function (g) { if (grein.indexOf(g) < 0) grein.push(g); }); });
    grein.sort(function (a, b) { return a.localeCompare(b, 'fo'); });
    function c(k, v, l) { return '<button type="button" class="av-chip" data-k="' + k + '" data-v="' + esc(v) + '" aria-pressed="' + ((k === 'd' ? fd : fg) === v ? 'true' : 'false') + '">' + esc(l) + '</button>'; }
    box.hidden = false;
    box.innerHTML = '<b>Deild</b>' + c('d', '', 'Allar') + deild.map(function (d) { return c('d', d, d); }).join('') +
      '<span class="av-sep"></span><b>Lærugrein</b>' + c('g', '', 'Allar') + grein.map(function (g) { return c('g', g, g); }).join('');
  }
  function grid() {
    var old = out.slice(0, -1).reverse();
    $('#av-old').hidden = !old.length;
    if (!old.length) return;
    $('#av-n').textContent = old.length + (old.length === 1 ? ' amboð' : ' amboð');
    chips(old);
    var list = old.filter(function (s) { return (!fd || s.deild.indexOf(fd) >= 0) && (!fg || s.grein.indexOf(fg) >= 0); });
    $('#av-grid').innerHTML = list.length ? list.map(function (s) {
      return '<button type="button" class="av-tile" data-c="' + esc(s.c) + '" data-nr="' + s.nr + '" id="av-k-' + s.nr + '">' +
        '<span class="av-tile-i">' + ikon(s.ikon) + '</span>' +
        '<span class="av-tile-t"><span class="av-tile-d">Nr. ' + s.nr + ' · ' + fmt(date(s.d)) + '</span><b>' + esc(s.heiti) + '</b><span class="av-tile-u">' + esc(s.undir) + '</span></span>' +
        '<span class="av-tile-m">Les meira →</span></button>';
    }).join('') : '<p class="av-empty">Einki amboð var at finna. Royn eitt annað val.</p>';
  }
  var dlg = $('#av-dlg');
  function openOld(nr) {
    var s = out.filter(function (x) { return x.nr === nr; })[0];
    if (!s) return;
    dlg.setAttribute('data-c', s.c);
    dlg.innerHTML = '<div class="av-dlg-in"><button type="button" class="av-close" data-close>Lat aftur ✕</button>' + detail(s, false, 'av-dlg-h') + '</div>';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    history.replaceState(null, '', '#ambod-' + nr);
  }
  function closeDlg() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  dlg.addEventListener('close', function () { if (/^#ambod-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) closeDlg(); });
  root.addEventListener('click', function (e) {
    var t = e.target.closest('.av-tile');
    if (t) { openOld(+t.dataset.nr); return; }
    var b = e.target.closest('.av-chip');
    if (!b) return;
    if (b.dataset.k === 'd') fd = b.dataset.v; else fg = b.dataset.v;
    grid();
  });

  /* Hundurin: svevur, vaknar tá ið músin kemur, sigur VUFF! og tekur bóltin, tá ið trýst verður á hann */
  var dog = $('.av-dog'), sov = null;
  function vakna() { clearTimeout(sov); dog.classList.add('awake'); }
  function sovna() { clearTimeout(sov); sov = setTimeout(function () { dog.classList.remove('awake', 'ball'); }, 3000); }
  dog.addEventListener('mouseenter', vakna);
  dog.addEventListener('focus', vakna);
  dog.addEventListener('mouseleave', sovna);
  dog.addEventListener('blur', sovna);
  dog.addEventListener('click', function () {
    vakna();
    dog.classList.add('ball', 'bark');
    setTimeout(function () { dog.classList.remove('bark'); }, 900);
    sovna();
  });

  fetch(DATA_URL, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (all) {
    all.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
    out = all.filter(function (s) { return date(s.d) <= today; });
    next = all.filter(function (s) { return date(s.d) > today; })[0] || null;
    feature();
    grid();
    var m = location.hash.match(/^#ambod-(\d+)$/);
    if (m) {
      var nr = +m[1], newest = out.length ? out[out.length - 1].nr : 0;
      if (nr === newest) {
        setTimeout(function () { var el = $('#av-feature'); window.scrollTo(0, el.getBoundingClientRect().top + window.pageYOffset - 100); }, 400);
      } else openOld(nr);
    }
  }).catch(function () { $('#av-feature').innerHTML = '<p class="av-empty">Amboðini kundu ikki lesast inn. Royn aftur seinni.</p>'; });
})();
