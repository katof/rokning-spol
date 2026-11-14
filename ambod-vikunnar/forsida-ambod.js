/* Amboðið hesa vikuna á forsíðuni. Snar heintar hesa fílu frá GitHub (sí LÍM INN – forsíða.html).
   Skriptið setir tvær reglur inn undir tekstinum í „Vit mæla til“ (#c235548). Kann stubbar.json ikki lesast, kemur einki.
   Royna ein annan dag: legg ?dagur=2026-11-16 aftrat slóðini. */
(function () {
  /* Savnssíðan á Snar. Broyt her, um síðan fær eina aðra slóð. */
  var SAVN_URL = '/ambodid-hesa-vikuna';
  var me = document.currentScript && document.currentScript.src;
  var BASE = me ? me.replace(/[^\/]*$/, '') : 'https://katof.github.io/rokning-spol/ambod-vikunnar/';
  var DATA_URL = BASE + 'stubbar.json';

  var css =
    '#c235548 .snar-ambod{display:block!important;margin:2.2rem 0 0!important;padding:1.4rem 0 0!important;border:0!important;border-top:1px solid #dcdcd8!important;background:none!important;color:#2b2b2b!important;font-family:Roboto,Arial,Helvetica,sans-serif!important;text-decoration:none!important;max-width:26rem!important}' +
    '#c235548 .snar-ambod:focus-visible{outline:2px solid #2b2b2b!important;outline-offset:6px!important}' +
    '#c235548 .snar-ambod-kick{display:block!important;color:#c81d12!important;font-size:.8rem!important;font-weight:700!important;letter-spacing:.08em!important;text-transform:uppercase!important}' +
    '#c235548 .snar-ambod-title{display:block!important;margin-top:.35rem!important;font-size:1.75rem!important;font-weight:300!important;line-height:1.2!important}' +
    '#c235548 .snar-ambod-more{display:table!important;margin-top:.45rem!important;padding-bottom:3px!important;background:linear-gradient(#ef2418,#ef2418) 0 100%/0 2px no-repeat!important;font-size:1.05rem!important;line-height:1.45!important;transition:background-size .22s ease!important}' +
    '#c235548 .snar-ambod:hover .snar-ambod-more,#c235548 .snar-ambod:focus-visible .snar-ambod-more{background-size:100% 2px!important}' +
    '@media (prefers-reduced-motion:reduce){#c235548 .snar-ambod-more{transition:none!important}}';
  var stubbi = null;

  function dagur(s) { var a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }

  function tekna() {
    if (!stubbi) return;
    var teigur = document.getElementById('c235548');
    var text = teigur && (teigur.querySelector('.textpic-text') || teigur.querySelector('.frame-inner'));
    if (!text) return;
    if (!document.getElementById('snar-ambod-css')) {
      var st = document.createElement('style');
      st.id = 'snar-ambod-css';
      st.textContent = css;
      document.head.appendChild(st);
    }
    var gamalt = text.querySelector('.snar-ambod');
    if (gamalt) gamalt.remove();
    var a = document.createElement('a');
    a.className = 'snar-ambod';
    a.href = SAVN_URL + '#ambod-' + stubbi.nr;
    [['snar-ambod-kick', 'Amboðið hesa vikuna'], ['snar-ambod-title', stubbi.heiti], ['snar-ambod-more', stubbi.undir + ' →']].forEach(function (x) {
      var s = document.createElement('span');
      s.className = x[0];
      s.textContent = x[1];
      a.appendChild(s);
    });
    text.appendChild(a);
  }

  var q = new URLSearchParams(location.search).get('dagur');
  var idag = q ? dagur(q) : new Date();
  idag.setHours(0, 0, 0, 0);

  fetch(DATA_URL, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (all) {
    var uti = all.filter(function (s) { return dagur(s.d) <= idag; }).sort(function (x, y) { return x.d < y.d ? -1 : 1; });
    if (!uti.length) return;
    stubbi = uti[uti.length - 1];
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tekna); else tekna();
  }).catch(function () {});
})();
