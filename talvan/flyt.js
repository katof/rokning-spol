/* Flyting av Talvuni frá katof.github.io/rokning-spol/talvan til https://snar-talvan.github.io (17.11.2026).
   Liggur á GAMLA staðnum. Lesur tað, sum Talvan hevur goymt í kaganum her (bert lyklarnir hjá Talvuni og
   IndexedDB „snar-flokskiggi“), so tað kann verða sent til nýggja staðið. Onnur spøl á katof.github.io verða ikki nørt. */
(function () {
  var KEYS = ['snar-flokskiggi-v1', 'snar-talvan-mitt', 'snar-talvan-klipp'];
  window.SnarFlyt = function () {
    var ls = {}, n = 0;
    KEYS.forEach(function (k) { try { var v = localStorage.getItem(k); if (v != null) { ls[k] = v; n++; } } catch (e) {} });
    return new Promise(function (res) {
      function ut(idb) { res({ ls: ls, idb: idb, n: n + idb.length }); }
      try {
        var nyggj = false, rq = indexedDB.open('snar-flokskiggi', 1);
        /* Finst goymslan ikki, verður hon ikki stovnað her */
        rq.onupgradeneeded = function () { nyggj = true; rq.transaction.abort(); };
        rq.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); if (nyggj) { try { indexedDB.deleteDatabase('snar-flokskiggi'); } catch (x) {} } ut([]); };
        rq.onsuccess = function () {
          var db = rq.result, out = [];
          try {
            var c = db.transaction('f', 'readonly').objectStore('f').openCursor();
            c.onsuccess = function () { var cu = c.result; if (cu) { if (typeof cu.key === 'string') out.push([cu.key, cu.value]); cu.continue(); } else { db.close(); ut(out); } };
            c.onerror = function () { db.close(); ut([]); };
          } catch (e) { db.close(); ut([]); }
        };
      } catch (e) { ut([]); }
    });
  };
})();
