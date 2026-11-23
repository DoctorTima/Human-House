/* Human House · Схема привязки, версия 3 — геометрия, модель данных, отрисовка SVG. Без сетевых запросов.
   Файлы проекта совместимы с версией 2 (schemaVersion 1). */
(function () {
  'use strict';
  var INK = '#292822', ACC = '#BF512D', ERR = '#B3261E', FOREST = '#3E6B48', WATER = '#4E6E7A';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var uid = function (p) { return p + Math.random().toString(36).slice(2, 9); };
  var fmt = function (v, d) { d = d == null ? 2 : d; return Number.isFinite(v) ? v.toFixed(d).replace('.', ',').replace('-', '−') : '—'; };
  function num(v) {
    if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
    var s = String(v == null ? '' : v).trim().replace(/\s/g, '').replace(',', '.').replace('−', '-');
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return parseFloat(s);
  }
  var sub = function (a, b) { return { x: a.x - b.x, y: a.y - b.y }; };
  var dot = function (a, b) { return a.x * b.x + a.y * b.y; };
  var cross = function (a, b) { return a.x * b.y - a.y * b.x; };
  var len = function (a) { return Math.hypot(a.x, a.y); };
  var today = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  /* ---------- Каталог объектов ---------- */
  var OBJ = {
    entry: { g: 'Доступ техники', n: 'Въезд', k: 'line', arrow: 1, L: 6 },
    gate: { g: 'Доступ техники', n: 'Ворота', k: 'line', L: 4, gate: 1 },
    slabs: { g: 'Доступ техники', n: 'Площадка из дорожных плит', k: 'slabs' },
    temproad: { g: 'Доступ техники', n: 'Временный проезд', k: 'rect', w: 4, h: 12 },
    well: { g: 'Вода', n: 'Скважина', k: 'pt' },
    kolodec: { g: 'Вода', n: 'Колодец', k: 'pt' },
    waterpt: { g: 'Вода', n: 'Подключение водопровода', k: 'pt' },
    septic: { g: 'Канализация', n: 'Септик', k: 'pt' },
    overflow: { g: 'Канализация', n: 'Переливной колодец', k: 'pt' },
    sewerpt: { g: 'Канализация', n: 'Подключение канализации', k: 'pt' },
    pole: { g: 'Электричество', n: 'Столб ЛЭП', k: 'pt' },
    panel: { g: 'Электричество', n: 'Электрощит', k: 'pt' },
    powerpt: { g: 'Электричество', n: 'Точка подключения', k: 'pt' },
    powerline: { g: 'Электричество', n: 'Трасса кабеля', k: 'line', L: 10 },
    ditch: { g: 'Рельеф и вода', n: 'Канава', k: 'line', L: 20, ditch: 1 },
    flow: { g: 'Рельеф и вода', n: 'Направление стока', k: 'line', arrow: 1, L: 5 },
    pond: { g: 'Рельеф и вода', n: 'Пруд / водоём', k: 'ellipse', w: 8, h: 5 },
    slope: { g: 'Рельеф и вода', n: 'Уклон', k: 'line', arrow: 1, L: 6 },
    bench: { g: 'Рельеф и вода', n: 'Высотная отметка', k: 'pt' },
    tree: { g: 'Растительность', n: 'Дерево', k: 'circle', d: 5 },
    trees: { g: 'Растительность', n: 'Группа деревьев', k: 'ellipse', w: 10, h: 6 },
    shrub: { g: 'Растительность', n: 'Кусты', k: 'ellipse', w: 3, h: 2 },
    cabin: { g: 'Существующие объекты', n: 'Бытовка', k: 'rect', w: 6, h: 2.4 },
    bath: { g: 'Существующие объекты', n: 'Баня', k: 'rect', w: 6, h: 4 },
    exhouse: { g: 'Существующие объекты', n: 'Существующий дом', k: 'rect', w: 10, h: 8 },
    neighbor: { g: 'Существующие объекты', n: 'Соседнее строение', k: 'rect', w: 8, h: 6 },
    fence: { g: 'Существующие объекты', n: 'Забор', k: 'line', L: 10, fence: 1 },
    road: { g: 'Существующие объекты', n: 'Дорога', k: 'rect', w: 30, h: 6 },
    soil: { g: 'Существующие объекты', n: 'Складирование грунта', k: 'ellipse', w: 6, h: 4 },
    terrace: { g: 'Существующие объекты', n: 'Терраса / крыльцо', k: 'rect', w: 6, h: 3 },
    point: { g: 'Универсальные', n: 'Точка', k: 'pt' },
    line: { g: 'Универсальные', n: 'Линия', k: 'line', L: 6 },
    zone: { g: 'Универсальные', n: 'Зона', k: 'rect', w: 5, h: 5 },
    arrow: { g: 'Универсальные', n: 'Стрелка', k: 'line', arrow: 1, L: 4 },
    label: { g: 'Универсальные', n: 'Подпись', k: 'text' }
  };
  var GROUPS = ['Доступ техники', 'Вода', 'Канализация', 'Электричество', 'Рельеф и вода', 'Растительность', 'Существующие объекты', 'Универсальные'];
  var STATUS = { exists: 'существует', planned: 'планируется', unknown: 'неизвестно' };
  var LETS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  var SLAB = { L: 3, W: 1.75, name: 'дорожная плита 2П30.18' };
  function lt(i) { return i < LETS.length ? LETS[i] : LETS[i % LETS.length] + Math.floor(i / LETS.length); }

  function newObj(type, x, y, x2, y2) {
    var c = OBJ[type], o = { id: uid('o'), type: type, name: c.n, status: type === 'slabs' ? 'planned' : 'exists', comment: '', x: x, y: y, rot: 0 };
    if (c.k === 'line') { o.x2 = x2 != null ? x2 : x + c.L; o.y2 = y2 != null ? y2 : y; }
    if (c.k === 'rect' || c.k === 'ellipse') { o.w = c.w; o.h = c.h; }
    if (c.k === 'circle') o.d = c.d;
    if (c.k === 'slabs') { o.rows = 2; o.cols = 2; o.sw = SLAB.L; o.sh = SLAB.W; o.gap = 0; }
    if (c.k === 'text') o.name = 'Подпись';
    return o;
  }
  function slabSize(o) { return { w: o.cols * o.sw + (o.cols - 1) * o.gap, h: o.rows * o.sh + (o.rows - 1) * o.gap }; }

  /* ---------- Документ ---------- */
  function blankDoc() {
    var t = new Date().toISOString();
    return {
      schemaVersion: 1, projectId: uid('p'), revision: 0, createdAt: t, updatedAt: t, demo: false,
      meta: { actNo: '', actDate: today(), customer: '', address: '', cadastral: '', contractNo: '', contractDate: '', projectName: '', slopeMm: '', slopeDir: '', benchType: '', benchDesc: '', benchMark: '', engineer: '', notes: '', elevMode: 'rod', tofH: '', trayH: '', pipeH: '' },
      util: { sewer: { s: '', c: '' }, water: { s: '', c: '', hatch: '', pipe: '' }, power: { s: '', c: '' }, drain: { s: '', c: '' } },
      parcel: { verts: [], closed: false, source: '', approx: true, labels: {} },
      building: null, anchors: [], objects: [], underlay: null, review: null, print: { split: false }
    };
  }
  function rectParcel(d, W, D) {
    d.parcel = { verts: [{ id: 'p1', x: 0, y: 0 }, { id: 'p2', x: W, y: 0 }, { id: 'p3', x: W, y: D }, { id: 'p4', x: 0, y: D }], closed: true, source: 'rect', approx: false, labels: {} };
  }
  function newBuilding(shape, x, y) {
    return { shape: shape, w: shape === 'L' ? 20 : 20, l: shape === 'L' ? 12 : 10, cutW: 8, cutL: 5, corner: 'tr', x: x, y: y, angle: 0, ref: 'walls', refNote: '', name: shape === 'L' ? 'Демонстрационный Г-образный дом' : 'Демонстрационный дом 20 × 10 м' };
  }
  function demoDoc(shape) {
    var d = blankDoc(); d.demo = true;
    rectParcel(d, 30, 40);
    d.parcel.labels = { 'p1>p2': 'дорога', 'p4>p1': 'соседний участок', 'p3>p4': 'соседний участок' };
    d.meta = { actNo: 'ДЕМО-001', actDate: today(), customer: 'Иванов И. И. (вымышленный)', address: 'Демонстрационный адрес, участок 1', cadastral: '', contractNo: 'ДЕМО-12', contractDate: '', projectName: shape === 'L' ? 'Демонстрационный Г-образный дом' : 'Демонстрационный дом 20 × 10 м', slopeMm: '140', slopeDir: 'стрелка «Уклон» на схеме', benchType: '', benchDesc: '', benchMark: '', engineer: 'Петров П. П. (вымышленный)', notes: 'Демонстрационный пример. Расположение объектов не является проектным решением.', elevMode: 'rod', tofH: '300' };
    d.meta.slopeMm = ''; d.meta.slopeDir = '';
    d.util = { sewer: { s: 'planned', c: 'септик на участке' }, water: { s: 'yes', c: 'скважина', hatch: '', pipe: '' }, power: { s: 'yes', c: 'столб у дороги' }, drain: { s: 'yes', c: 'придорожная канава' } };
    if (shape === 'L') {
      d.building = newBuilding('L', 15, 16); d.building.elev = { l1: 141.5, l2: 155, l3: 147, l4: 139, l5: 136.5, l6: 131.5 };
      d.anchors = [
        { id: 'a1', kind: 'perp', v: 'l1', seg: { a: 'p1', b: 'p2' }, primary: true, lo: { x: 0, y: 0 }, obs: null },
        { id: 'a2', kind: 'perp', v: 'l2', seg: { a: 'p1', b: 'p2' }, primary: true, lo: { x: 0, y: 0 }, obs: null },
        { id: 'a3', kind: 'perp', v: 'l2', seg: { a: 'p2', b: 'p3' }, primary: true, lo: { x: 0, y: 0.8 }, obs: null }
      ];
    } else {
      d.building = newBuilding('rect', 15, 15); d.building.elev = { r1: 141.5, r2: 155, r3: 139, r4: 131.5 };
      d.anchors = [
        { id: 'a1', kind: 'perp', v: 'r1', seg: { a: 'p1', b: 'p2' }, primary: true, lo: { x: 0, y: 0 }, obs: null },
        { id: 'a2', kind: 'perp', v: 'r2', seg: { a: 'p1', b: 'p2' }, primary: true, lo: { x: 0, y: 0 }, obs: null },
        { id: 'a3', kind: 'perp', v: 'r2', seg: { a: 'p2', b: 'p3' }, primary: true, lo: { x: 0, y: 0.8 }, obs: null }
      ];
    }
    var o = function (t, x, y, ex) { var r = newObj(t, x, y); for (var k in ex) r[k] = ex[k]; return r; };
    d.objects = [
      o('road', 15, -4.5, { w: 44, h: 6 }),
      o('ditch', -6, -1, { x2: 36, y2: -1, name: 'Канава придорожная' }),
      o('entry', 27.5, -3, { x2: 27.5, y2: 1.2 }),
      o('slabs', 27.5, 4.6, { rows: 3, cols: 2, sw: 2, sh: 1.75 }),
      o('well', 9, 27),
      o('septic', 3, 5, { status: 'planned' }),
      o('pole', 29, -0.3),
      o('tree', 23, 33, { d: 5 })
    ];
    return d;
  }

  /* ---------- Геометрия ---------- */
  function polyArea(p) { var s = 0; for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += a.x * b.y - b.x * a.y; } return s / 2; }
  function segs(parcel) {
    var v = parcel.verts, n = v.length, out = [], m = parcel.closed ? n : n - 1;
    for (var i = 0; i < m; i++) { var a = v[i], b = v[(i + 1) % n]; out.push({ i: i, n: i + 1, a: a, b: b, key: a.id + '>' + b.id, len: len(sub(b, a)), label: (parcel.labels || {})[a.id + '>' + b.id] || '' }); }
    return out;
  }
  function findSeg(parcel, ref) { if (!ref) return null; var s = segs(parcel); for (var i = 0; i < s.length; i++) if (s[i].a.id === ref.a && s[i].b.id === ref.b) return s[i]; return null; }
  function properX(p1, p2, p3, p4) {
    var d1 = cross(sub(p4, p3), sub(p1, p3)), d2 = cross(sub(p4, p3), sub(p2, p3)), d3 = cross(sub(p2, p1), sub(p3, p1)), d4 = cross(sub(p2, p1), sub(p4, p1));
    return ((d1 > 1e-9 && d2 < -1e-9) || (d1 < -1e-9 && d2 > 1e-9)) && ((d3 > 1e-9 && d4 < -1e-9) || (d3 < -1e-9 && d4 > 1e-9));
  }
  function selfX(pts) {
    var n = pts.length, r = [];
    for (var i = 0; i < n; i++) for (var j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      var a = pts[i], b = pts[(i + 1) % n], c = pts[j], d = pts[(j + 1) % n];
      if (properX(a, b, c, d)) { var t = cross(sub(c, a), sub(d, c)) / cross(sub(b, a), sub(d, c)); r.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) }); }
    }
    return r;
  }
  function inPoly(p, pts) { var c = false; for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) { var a = pts[i], b = pts[j]; if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; }
  function perp(P, A, B) {
    var d = sub(B, A), L2 = dot(d, d); if (L2 < 1e-9) return null;
    var t = dot(sub(P, A), d) / L2, F = { x: A.x + t * d.x, y: A.y + t * d.y };
    return { t: t, F: F, dist: len(sub(P, F)), outside: t < -1e-6 || t > 1 + 1e-6 };
  }
  function houseLocal(b) {
    var W = b.w, L = b.l, p, pre = b.shape === 'L' ? 'l' : 'r';
    if (b.shape === 'L') {
      var cw = Math.min(b.cutW, W - 0.5), cl = Math.min(b.cutL, L - 0.5);
      p = {
        tr: [[0, 0], [W, 0], [W, L - cl], [W - cw, L - cl], [W - cw, L], [0, L]],
        tl: [[0, 0], [W, 0], [W, L], [cw, L], [cw, L - cl], [0, L - cl]],
        br: [[0, 0], [W - cw, 0], [W - cw, cl], [W, cl], [W, L], [0, L]],
        bl: [[cw, 0], [W, 0], [W, L], [0, L], [0, cl], [cw, cl]]
      }[b.corner] || [];
    } else if (b.shape === 'poly') return polyLocal(b);
    else p = [[0, 0], [W, 0], [W, L], [0, L]];
    return p.map(function (q, i) { return { id: pre + (i + 1), x: q[0] - W / 2, y: q[1] - L / 2 }; });
  }
  function polyRaw(b) {
    var p = { x: 0, y: 0 }, pts = [p], h = (b.h0 || 0) * Math.PI / 180, ws = b.walls || [];
    for (var i = 0; i < ws.length; i++) { p = { x: p.x + Math.cos(h) * ws[i].len, y: p.y + Math.sin(h) * ws[i].len }; pts.push(p); h -= ws[i].turn * Math.PI / 180; }
    return pts;
  }
  function polyLocal(b) {
    var pts = polyRaw(b);
    if (pts.length > 3 && len(sub(pts[pts.length - 1], pts[0])) < 0.03) pts.pop();
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    pts.forEach(function (q) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); });
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return pts.map(function (q, i) { return { id: 'w' + (i + 1), x: q.x - cx, y: q.y - cy }; });
  }
  function angN(d) { while (d > 180) d -= 360; while (d <= -180) d += 360; return d; }
  function polyClosure(b) {
    var pts = polyRaw(b), n = pts.length, e = sub(pts[0], pts[n - 1]), L = len(e), ws = b.walls || [];
    var ortho = ws.slice(0, -1).every(function (w) { var r = Math.abs(w.turn) % 90; return r < 0.5 || r > 89.5; });
    if (L < 0.03) return { len: 0, ok90: true, ortho: ortho };
    var ae = Math.atan2(e.y, e.x) * 180 / Math.PI, la = sub(pts[n - 1], pts[n - 2]), fa = sub(pts[1], pts[0]);
    var ok = function (d) { var r = Math.abs(angN(d)) % 90; return r < 0.5 || r > 89.5; };
    return { len: L, ok90: ok(ae - Math.atan2(la.y, la.x) * 180 / Math.PI) && ok(Math.atan2(fa.y, fa.x) * 180 / Math.PI - ae), ortho: ortho };
  }
  function wallsFromPts(pts) {
    if (polyArea(pts) > 0) pts = [pts[0]].concat(pts.slice(1).reverse());
    var s = 0; pts.forEach(function (q, i) { var b = pts[s]; if (q.y > b.y + 1e-6 || (Math.abs(q.y - b.y) <= 1e-6 && q.x < b.x)) s = i; });
    pts = pts.slice(s).concat(pts.slice(0, s));
    var n = pts.length, ws = [], ang = function (a, b) { return Math.atan2(b.y - a.y, b.x - a.x); };
    for (var i = 0; i < n - 1; i++) {
      var d = angN((ang(pts[i + 1], pts[(i + 2) % n]) - ang(pts[i], pts[i + 1])) * 180 / Math.PI);
      ws.push({ len: Math.round(len(sub(pts[i + 1], pts[i])) * 1000) / 1000, turn: Math.round(-d * 10) / 10 });
    }
    return { h0: Math.round(ang(pts[0], pts[1]) * 1800 / Math.PI) / 10, walls: ws };
  }
  function tplPts(kind, W, L, a, c) {
    var p = {
      rect: [[0, 0], [W, 0], [W, L], [0, L]],
      L: [[0, 0], [W, 0], [W, L - c], [W - a, L - c], [W - a, L], [0, L]],
      T: [[0, 0], [W, 0], [W, L - c], [(W + a) / 2, L - c], [(W + a) / 2, L], [(W - a) / 2, L], [(W - a) / 2, L - c], [0, L - c]],
      U: [[0, 0], [W, 0], [W, L], [(W + a) / 2, L], [(W + a) / 2, L - c], [(W - a) / 2, L - c], [(W - a) / 2, L], [0, L]],
      bump: [[0, 0], [W, 0], [W, L], [(W + a) / 2, L], [(W + a) / 2, L + c], [(W - a) / 2, L + c], [(W - a) / 2, L], [0, L]]
    }[kind];
    return p.map(function (q) { return { x: q[0], y: -q[1] }; });
  }
  function houseDims(b) {
    var l = houseLocal(b), x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    l.forEach(function (q) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); });
    return { w: x1 - x0, l: y1 - y0 };
  }
  function objAnchors(o) {
    var c = OBJ[o.type]; if (!c || c.k === 'text') return [];
    if (c.k === 'line') return [{ id: 'e1', x: o.x, y: o.y, n: 'начало' }, { id: 'e2', x: o.x2, y: o.y2, n: 'конец' }];
    var r = [{ id: 'c0', x: o.x, y: o.y, n: 'центр' }];
    if (c.k === 'rect' || c.k === 'slabs') objPts(o).forEach(function (p, i) { r.push({ id: 'c' + (i + 1), x: p.x, y: p.y, n: 'угол ' + (i + 1) }); });
    return r;
  }
  function houseWorld(b) {
    if (!b) return [];
    var a = b.angle * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return houseLocal(b).map(function (p) { return { id: p.id, x: b.x + p.x * c - p.y * s, y: b.y + p.x * s + p.y * c }; });
  }
  function letterOf(b, id) { var l = houseLocal(b); for (var i = 0; i < l.length; i++) if (l[i].id === id) return lt(i); return '?'; }
  function anchorInfo(doc, an) {
    var V = null, i;
    if (an.src) {
      var ob = null; for (i = 0; i < doc.objects.length; i++) if (doc.objects[i].id === an.src) ob = doc.objects[i];
      if (!ob) return { lost: true, why: 'постройка удалена' };
      var oa = objAnchors(ob); for (i = 0; i < oa.length; i++) if (oa[i].id === an.v) V = oa[i];
      if (!V) return { lost: true, why: 'точка постройки не найдена' };
    } else {
      var hv = houseWorld(doc.building);
      for (i = 0; i < hv.length; i++) if (hv[i].id === an.v) V = hv[i];
      if (!V) return { lost: true, why: 'угол дома удалён или контур изменён' };
    }
    if (an.kind === 'p2p') {
      var T = null; for (i = 0; i < doc.parcel.verts.length; i++) if (doc.parcel.verts[i].id === an.t) T = doc.parcel.verts[i];
      if (!T) return { lost: true, why: 'вершина участка удалена' };
      return { V: V, F: T, dist: len(sub(V, T)), outside: false };
    }
    var s = findSeg(doc.parcel, an.seg);
    if (!s) return { lost: true, why: 'сторона участка удалена или изменена' };
    var r = perp(V, s.a, s.b); if (!r) return { lost: true, why: 'сторона нулевой длины' };
    return { V: V, F: r.F, dist: r.dist, outside: r.outside, t: r.t, seg: s };
  }
  function tiePoints(doc) {
    var tie = {}, n = 0;
    if (!doc.building) return tie;
    doc.anchors.forEach(function (an) { if (an.src || !an.primary) return; var inf = anchorInfo(doc, an); if (inf.lost) return; if (!tie[an.v]) tie[an.v] = ++n; });
    return tie;
  }
  function inwardNormal(parcel, s) {
    var d = sub(s.b, s.a), L = len(d), u = { x: d.x / L, y: d.y / L };
    var ccw = polyArea(parcel.verts) > 0;
    return { u: u, n: ccw ? { x: -u.y, y: u.x } : { x: u.y, y: -u.x } };
  }
  function placeByTwo(doc, V, r1, d1, r2, d2) {
    if (!doc.parcel.closed) return { err: 'Сначала замкните границу участка.' };
    var s1 = findSeg(doc.parcel, r1), s2 = findSeg(doc.parcel, r2);
    if (!s1 || !s2) return { err: 'Выберите две стороны участка.' };
    if (s1.key === s2.key) return { err: 'Нужны две разные стороны.' };
    if (!(d1 >= 0) || !(d2 >= 0)) return { err: 'Введите оба отступа в метрах.' };
    var A = inwardNormal(doc.parcel, s1), B = inwardNormal(doc.parcel, s2);
    if (Math.abs(cross(A.u, B.u)) < Math.sin(10 * Math.PI / 180)) return { err: 'Выбранные стороны почти параллельны — положение по ним неустойчиво. Выберите смежные стороны.' };
    var c1 = d1 + dot(A.n, s1.a), c2 = d2 + dot(B.n, s2.a), det = A.n.x * B.n.y - A.n.y * B.n.x;
    var X = { x: (c1 * B.n.y - A.n.y * c2) / det, y: (A.n.x * c2 - c1 * B.n.x) / det };
    if (!V) return { err: 'Выберите точку.' };
    return { dx: X.x - V.x, dy: X.y - V.y };
  }
  function houseOutside(doc) {
    if (!doc.building || !doc.parcel.closed || doc.parcel.verts.length < 3) return false;
    var hv = houseWorld(doc.building), pv = doc.parcel.verts, i, j;
    for (i = 0; i < hv.length; i++) if (!inPoly(hv[i], pv)) return true;
    for (i = 0; i < hv.length; i++) for (j = 0; j < pv.length; j++) if (properX(hv[i], hv[(i + 1) % hv.length], pv[j], pv[(j + 1) % pv.length])) return true;
    return false;
  }
  function objPts(o) {
    var c = OBJ[o.type]; if (!c) return [];
    if (c.k === 'line') return [{ x: o.x, y: o.y }, { x: o.x2, y: o.y2 }];
    var w = 1, h = 1;
    if (c.k === 'rect' || c.k === 'ellipse') { w = o.w; h = o.h; } else if (c.k === 'circle') { w = h = o.d; } else if (c.k === 'slabs') { var z = slabSize(o); w = z.w; h = z.h; }
    var a = (o.rot || 0) * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { var x = q[0] * w / 2, y = q[1] * h / 2; return { x: o.x + x * cs - y * sn, y: o.y + x * sn + y * cs }; });
  }
  function bounds(doc, withUnderlay) {
    var pts = [].concat(doc.parcel.verts, houseWorld(doc.building));
    doc.objects.forEach(function (o) { pts = pts.concat(objPts(o)); });
    if ((withUnderlay || !pts.length) && doc.underlay) { var u = doc.underlay; pts.push({ x: u.x, y: u.y }, { x: u.x + u.iw * u.mpp, y: u.y + u.ih * u.mpp }); }
    if (!pts.length) return { x0: -10, y0: -10, x1: 40, y1: 50 };
    var b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    pts.forEach(function (p) { b.x0 = Math.min(b.x0, p.x); b.y0 = Math.min(b.y0, p.y); b.x1 = Math.max(b.x1, p.x); b.y1 = Math.max(b.y1, p.y); });
    if (b.x1 - b.x0 < 5) { b.x0 -= 5; b.x1 += 5; } if (b.y1 - b.y0 < 5) { b.y0 -= 5; b.y1 += 5; }
    return b;
  }
  function fitView(doc, W, H, padPx, withUl) {
    var b = bounds(doc, withUl), k = Math.min((W - 2 * padPx) / (b.x1 - b.x0), (H - 2 * padPx) / (b.y1 - b.y0));
    return { W: W, H: H, k: Math.max(0.5, Math.min(k, 400)), cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2 };
  }

  /* ---------- Проверки ---------- */
  /* ---------- Рельеф: отметки углов ---------- */
  function elevInfo(doc) {
    var B = doc.building; if (!B) return null;
    var rod = (doc.meta.elevMode || 'rod') !== 'abs', ev = B.elev || {}, hv = houseWorld(B);
    var pts = hv.map(function (v, i) { var raw = ev[v.id]; return { id: v.id, L: lt(i), x: v.x, y: v.y, raw: Number.isFinite(raw) ? raw : null }; });
    pts.forEach(function (p) { p.h = p.raw == null ? null : (rod ? -p.raw / 100 : p.raw); });
    var got = pts.filter(function (p) { return p.h != null; }), miss = pts.filter(function (p) { return p.h == null; });
    var r = { rod: rod, unit: rod ? 'см' : 'м', dec: rod ? 1 : 2, pts: pts, n: got.length, miss: miss };
    if (got.length < 2) return r;
    var hi = got[0], lo = got[0];
    got.forEach(function (p) { if (p.h > hi.h) hi = p; if (p.h < lo.h) lo = p; });
    var dz = hi.h - lo.h, dist = Math.hypot(lo.x - hi.x, lo.y - hi.y);
    r.hi = hi; r.lo = lo; r.dropMm = Math.round(dz * 1000); r.dist = dist;
    r.pct = dist > 0.01 ? dz / dist * 100 : 0; r.deg = dist > 0.01 ? Math.atan(dz / dist) * 180 / Math.PI : 0;
    var tof = num(doc.meta.tofH);
    pts.forEach(function (p) { if (p.h == null) return; p.below = Math.round((hi.h - p.h) * 1000); p.plinth = Number.isFinite(tof) ? Math.round(tof + p.below) : null; });
    r.tof = Number.isFinite(tof) ? tof : null;
    return r;
  }
  function elevText(e) {
    if (!e || e.n < 2) return '';
    return 'Перепад ' + e.dropMm + ' мм (от ' + e.hi.L + ' к ' + e.lo.L + ', ' + fmt(e.dist, 1) + ' м) · уклон ' + fmt(e.pct, 1) + ' % · ' + fmt(e.deg, 1) + '°';
  }
  function segDist(P, A, B) { var d = sub(B, A), L2 = dot(d, d), t = L2 < 1e-9 ? 0 : Math.max(0, Math.min(1, dot(sub(P, A), d) / L2)); return len(sub(P, { x: A.x + t * d.x, y: A.y + t * d.y })); }
  function polyDist(pa, pb) {
    var m = Infinity, i, j;
    for (i = 0; i < pa.length; i++) for (j = 0; j < pb.length; j++) {
      m = Math.min(m, segDist(pa[i], pb[j], pb[(j + 1) % pb.length]), segDist(pb[j], pa[i], pa[(i + 1) % pa.length]));
    }
    return m;
  }

  var UT = { sewer: 'канализация', water: 'водоснабжение', power: 'электричество', drain: 'канава / водоотведение' };
  function checks(doc) {
    var r = [], P = doc.parcel, add = function (lvl, step, text, sel) { r.push({ lvl: lvl, step: step, text: text, sel: sel || null }); };
    if (P.verts.length < 3 || !P.closed) add('err', 'parcel', 'Нет замкнутой границы участка.');
    else {
      if (selfX(P.verts).length) add('err', 'parcel', 'Граница участка самопересекается — проверьте порядок вершин.');
      segs(P).forEach(function (s) { if (s.len < 0.01) add('err', 'parcel', 'Сторона ' + s.n + ' нулевой длины — удалите лишнюю вершину.'); });
      if (P.approx) add('warn', 'parcel', 'Граница задана схематично — площадь приблизительная.');
    }
    if (!doc.building) add('err', 'house', 'Не задан контур дома.');
    else {
      if (houseOutside(doc)) add('err', 'house', 'Дом пересекает границу участка.');
      if (doc.building.shape === 'poly') {
        var hl = houseLocal(doc.building), cl = polyClosure(doc.building);
        if (hl.length < 3) add('err', 'house', 'Контур дома: нужно минимум три угла.');
        else if (selfX(hl).length) add('err', 'house', 'Контур дома пересекает сам себя — проверьте длины стен и повороты.');
        if (cl.ortho && !cl.ok90) add('warn', 'house', 'Замыкающая стена (' + fmt(cl.len) + ' м) идёт не под прямым углом — проверьте длины стен.');
      }
      var prim = 0, segSet = {}, anyPerp = false;
      doc.anchors.forEach(function (a, i) {
        var inf = anchorInfo(doc, a), nm = 'Привязка ' + (i + 1);
        if (inf.lost) { add(a.src ? 'warn' : 'err', 'anchors', nm + ': ' + inf.why + '. Удалите или пересоздайте её.', { k: 'an', id: a.id }); return; }
        if (a.kind === 'perp' && !a.src) { anyPerp = true; if (a.primary) { prim++; segSet[a.seg.a + '>' + a.seg.b] = 1; } }
        if (inf.outside) add('warn', 'anchors', nm + ' измеряется до продолжения стороны (пунктир). Проверьте, что это намеренно.', { k: 'an', id: a.id });
        if (a.obs && Number.isFinite(a.obs.v) && Math.abs(a.obs.v - inf.dist) > 0.05) add('warn', 'anchors', nm + ': замер ' + fmt(a.obs.v) + ' м, на схеме ' + fmt(inf.dist) + ' м (Δ ' + fmt(a.obs.v - inf.dist) + ').', { k: 'an', id: a.id });
      });
      var E = elevInfo(doc);
      if (E.n > 0 && E.miss.length) add('warn', 'house', 'Нет высотной отметки у углов: ' + E.miss.map(function (p) { return p.L; }).join(', ') + '.', { k: 'house' });
      if (E.n >= 2 && E.dropMm > 500) add('warn', 'house', 'Перепад в пятне застройки ' + E.dropMm + ' мм — больше 0,5 м: согласуйте тип фундамента и вертикальную планировку.', { k: 'house' });
      var hw0 = houseWorld(doc.building);
      if (P.closed && P.verts.length > 2) segs(P).forEach(function (s) {
        var dd = Infinity; for (var q = 0; q < hw0.length; q++) dd = Math.min(dd, segDist(hw0[q], s.a, s.b), segDist(s.a, hw0[q], hw0[(q + 1) % hw0.length]));
        var road = /дорог|улиц|проезд/i.test(s.label || ''), lim = /улиц/i.test(s.label || '') ? 5 : 3;
        if (dd < lim - 0.005 && !houseOutside(doc)) add('warn', 'house', 'До стороны ' + s.n + (s.label ? ' (' + s.label + ')' : '') + ' ' + fmt(dd) + ' м — меньше ' + lim + ' м' + (road ? ' от ' + (lim === 5 ? 'красной линии улицы' : 'проезда') : ' до границы соседнего участка') + ' (СП 53.13330). Отметьте согласование в примечаниях.', { k: 'house' });
      });
      doc.objects.forEach(function (ob) {
        if (ob.type !== 'septic') return;
        var dd = polyDist([{ x: ob.x, y: ob.y }], hw0);
        if (dd < 5) add('warn', 'objects', 'Септик в ' + fmt(dd) + ' м от дома — ориентир не меньше 5 м. Уточните по паспорту септика.', { k: 'obj', id: ob.id });
      });
      var tp = Object.keys(tiePoints(doc)).length;
      if (tp < 3) add('err', 'anchors', 'Точек привязки дома ' + tp + ' из 3 — нужен размер от трёх разных углов.');
      if (prim && Object.keys(segSet).length < 2) add('err', 'anchors', 'Все привязки идут к одной стороне — нужна вторая граница участка.');
      if (!anyPerp && !doc.anchors.length) { /* покрыто выше */ }
    }
    var m = doc.meta, miss = [];
    [['actNo', 'номер акта'], ['actDate', 'дата'], ['customer', 'заказчик'], ['address', 'адрес участка'], ['engineer', 'инженер технадзора']].forEach(function (f) { if (!String(m[f[0]] || '').trim()) miss.push(f[1]); });
    if (miss.length) add('warn', 'act', 'Не заполнены поля акта: ' + miss.join(', ') + '.');
    var E2 = doc.building ? elevInfo(doc) : null;
    if (doc.building && (!E2 || E2.n < 2) && !String(m.slopeMm || '').trim()) add('warn', 'house', 'Нет данных о рельефе: введите высотные отметки углов дома (или перепад вручную в акте).', { k: 'house' });
    var un = Object.keys(UT).filter(function (k) { return !doc.util[k].s; });
    if (un.length) add('warn', 'act', 'Не указано состояние: ' + un.map(function (k) { return UT[k]; }).join(', ') + '.');
    var has = function (types) { return doc.objects.some(function (o) { return types.indexOf(o.type) >= 0; }); };
    if (doc.util.water.s === 'no' && has(['well', 'kolodec', 'waterpt'])) add('warn', 'act', 'Водоснабжение отмечено «нет», но на схеме есть скважина/колодец — уточните.');
    if (doc.util.sewer.s === 'no' && has(['septic', 'overflow', 'sewerpt'])) add('warn', 'act', 'Канализация отмечена «нет», но на схеме есть септик — уточните.');
    if (doc.util.power.s === 'no' && has(['pole', 'panel', 'powerpt', 'powerline'])) add('warn', 'act', 'Электричество отмечено «нет», но на схеме есть объекты электроснабжения — уточните.');
    if (doc.util.drain.s === 'no' && has(['ditch'])) add('warn', 'act', 'Канава отмечена «нет», но нарисована на схеме — уточните.');
    return r;
  }

  /* ---------- Отрисовка ---------- */
  function tw(t, fs) { return String(t).length * fs * 0.56 + 10; }
  function rdAng(a) { a = a * 180 / Math.PI; while (a > 90) a -= 180; while (a < -90) a += 180; return a; }
  function txt(x, y, t, o) {
    o = o || {}; var fs = o.fs || 11, ang = o.ang || 0, w = tw(t, fs), h = fs + 6;
    var s = '<g transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')"' + (o.hit ? ' data-hit="' + o.hit + '" style="cursor:pointer"' : ' pointer-events="none"') + '>';
    if (o.bg !== false) s += '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="3" fill="' + (o.bgc || '#fff') + '"' + (o.box ? ' stroke="' + o.box + '" stroke-width="1.4"' : '') + '/>';
    s += '<text x="0" y="' + (fs * 0.36).toFixed(1) + '" text-anchor="middle" font-size="' + fs + '" font-weight="' + (o.fw || 500) + '" fill="' + (o.c || INK) + '"' + (o.bg === false ? ' stroke="' + (o.halo || '#FAF9F4') + '" stroke-width="3" paint-order="stroke"' : '') + '>' + esc(t) + '</text></g>';
    return s;
  }
  function tick(x, y, ang) { var a = ang + Math.PI / 4, d = 5; return '<line x1="' + (x - Math.cos(a) * d) + '" y1="' + (y - Math.sin(a) * d) + '" x2="' + (x + Math.cos(a) * d) + '" y2="' + (y + Math.sin(a) * d) + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
  function dash(st) { return st === 'planned' ? ' stroke-dasharray="7 4"' : st === 'unknown' ? ' stroke-dasharray="2 4"' : ''; }
  function stSuf(o) { return o.status === 'planned' ? ' (план.)' : o.status === 'unknown' ? ' (?)' : ''; }

  function renderObj(o, S, k, ui, opt) {
    opt = opt || {};
    var c = OBJ[o.type]; if (!c) return '';
    var sel = ui.sel && ui.sel.k === 'obj' && ui.sel.id === o.id && ui.mode !== 'print';
    var hit = opt.noHit ? '' : ' data-hit="obj:' + o.id + '"', ds = dash(o.status), s = '', p = S(o), name = opt.noName ? '' : o.name + stSuf(o);
    if (c.k === 'pt' || c.k === 'text') {
      var x = p[0], y = p[1];
      if (c.k === 'text') { s += txt(x, y, o.name || 'Подпись', { fs: 13, fw: 600, bg: false, ang: -(o.rot || 0) }); name = ''; }
      else {
        var g = '';
        switch (o.type) {
          case 'well': g = '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#fff" stroke="' + WATER + '" stroke-width="1.8"' + ds + '/><line x1="' + (x - 8) + '" y1="' + y + '" x2="' + (x + 8) + '" y2="' + y + '" stroke="' + WATER + '" stroke-width="1.4"/><line x1="' + x + '" y1="' + (y - 8) + '" x2="' + x + '" y2="' + (y + 8) + '" stroke="' + WATER + '" stroke-width="1.4"/>'; break;
          case 'kolodec': g = '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#fff" stroke="' + WATER + '" stroke-width="1.8"' + ds + '/><circle cx="' + x + '" cy="' + y + '" r="4" fill="none" stroke="' + WATER + '" stroke-width="1.4"/>'; break;
          case 'waterpt': g = '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#fff" stroke="' + WATER + '" stroke-width="1.8"' + ds + '/><text x="' + x + '" y="' + (y + 4) + '" font-size="10" font-weight="700" text-anchor="middle" fill="' + WATER + '">В</text>'; break;
          case 'septic': g = '<rect x="' + (x - 8) + '" y="' + (y - 8) + '" width="16" height="16" fill="#fff" stroke="' + INK + '" stroke-width="1.8"' + ds + '/><line x1="' + (x - 8) + '" y1="' + (y + 8) + '" x2="' + (x + 8) + '" y2="' + (y - 8) + '" stroke="' + INK + '" stroke-width="1.2"/>'; break;
          case 'overflow': g = '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#fff" stroke="' + INK + '" stroke-width="1.8"' + ds + '/><text x="' + x + '" y="' + (y + 4) + '" font-size="9" font-weight="700" text-anchor="middle" fill="' + INK + '">П</text>'; break;
          case 'sewerpt': g = '<rect x="' + (x - 7) + '" y="' + (y - 7) + '" width="14" height="14" fill="#fff" stroke="' + INK + '" stroke-width="1.8"' + ds + '/><text x="' + x + '" y="' + (y + 4) + '" font-size="9" font-weight="700" text-anchor="middle" fill="' + INK + '">К</text>'; break;
          case 'pole': g = '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#fff" stroke="' + INK + '" stroke-width="1.4"' + ds + '/><circle cx="' + x + '" cy="' + y + '" r="4" fill="' + INK + '"/>'; break;
          case 'panel': g = '<rect x="' + (x - 9) + '" y="' + (y - 6) + '" width="18" height="12" fill="#fff" stroke="' + INK + '" stroke-width="1.8"' + ds + '/><text x="' + x + '" y="' + (y + 4) + '" font-size="9" font-weight="700" text-anchor="middle" fill="' + INK + '">Щ</text>'; break;
          case 'powerpt': g = '<path d="M' + x + ' ' + (y - 9) + 'L' + (x + 9) + ' ' + (y + 7) + 'L' + (x - 9) + ' ' + (y + 7) + 'Z" fill="#fff" stroke="' + INK + '" stroke-width="1.6"' + ds + '/><text x="' + x + '" y="' + (y + 5) + '" font-size="8" font-weight="700" text-anchor="middle" fill="' + INK + '">Э</text>'; break;
          case 'bench': g = '<path d="M' + (x - 8) + ' ' + (y - 7) + 'L' + (x + 8) + ' ' + (y - 7) + 'L' + x + ' ' + (y + 6) + 'Z" fill="#fff" stroke="' + INK + '" stroke-width="1.6"' + ds + '/><path d="M' + (x - 8) + ' ' + (y - 7) + 'L' + x + ' ' + (y - 7) + 'L' + x + ' ' + (y + 6) + 'Z" fill="' + INK + '"/>'; break;
          default: g = '<circle cx="' + x + '" cy="' + y + '" r="4.5" fill="' + INK + '"/>';
        }
        s += g;
      }
      if (sel) s += '<circle cx="' + x + '" cy="' + y + '" r="16" fill="none" stroke="' + ACC + '" stroke-width="2" stroke-dasharray="4 3"/>';
      if (name) s += txt(x + 14, y - 12, name, { fs: 11, bg: false }).replace('text-anchor="middle"', 'text-anchor="start"');
      if (hit) s += '<circle cx="' + x + '" cy="' + y + '" r="22" fill="transparent"' + hit + '/>';
      return s;
    }
    if (c.k === 'line') {
      var a = S({ x: o.x, y: o.y }), b = S({ x: o.x2, y: o.y2 }), ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      var ln = function (sw, col, extra) { return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + col + '" stroke-width="' + sw + '"' + (extra || '') + '/>'; };
      if (c.fence) { s += ln(1.6, INK, ds); for (var q = 12; q < L - 6; q += 22) { var fx = a[0] + Math.cos(ang) * q, fy = a[1] + Math.sin(ang) * q; s += '<path d="M' + (fx - 4) + ' ' + (fy - 4) + 'L' + (fx + 4) + ' ' + (fy + 4) + 'M' + (fx + 4) + ' ' + (fy - 4) + 'L' + (fx - 4) + ' ' + (fy + 4) + '" stroke="' + INK + '" stroke-width="1.3"/>'; } }
      else if (c.gate) { s += ln(4, INK, ds) + tick(a[0], a[1], ang + Math.PI / 4) + tick(b[0], b[1], ang + Math.PI / 4); name += ' ' + fmt(Math.hypot(o.x2 - o.x, o.y2 - o.y), 1) + ' м'; }
      else if (c.ditch) { s += ln(1.4, WATER, ds); var ox = -Math.sin(ang) * 4, oy = Math.cos(ang) * 4; s += '<line x1="' + (a[0] + ox) + '" y1="' + (a[1] + oy) + '" x2="' + (b[0] + ox) + '" y2="' + (b[1] + oy) + '" stroke="' + WATER + '" stroke-width="1.4"' + ds + '/>'; for (var q2 = 30; q2 < L - 10; q2 += 70) { var mx = a[0] + Math.cos(ang) * q2 + ox / 2, my = a[1] + Math.sin(ang) * q2 + oy / 2; s += '<path d="M' + (mx - Math.cos(ang - 0.5) * 7) + ' ' + (my - Math.sin(ang - 0.5) * 7) + 'L' + mx + ' ' + my + 'L' + (mx - Math.cos(ang + 0.5) * 7) + ' ' + (my - Math.sin(ang + 0.5) * 7) + '" fill="none" stroke="' + WATER + '" stroke-width="1.4"/>'; } }
      else if (o.type === 'powerline') s += ln(1.6, INK, ' stroke-dasharray="12 3 2 3"');
      else s += ln(o.type === 'entry' ? 2.4 : 1.6, o.type === 'flow' ? WATER : INK, ds);
      if (c.arrow) { var hx = b[0], hy = b[1], d = 11; s += '<path d="M' + (hx - Math.cos(ang - 0.42) * d) + ' ' + (hy - Math.sin(ang - 0.42) * d) + 'L' + hx + ' ' + hy + 'L' + (hx - Math.cos(ang + 0.42) * d) + ' ' + (hy - Math.sin(ang + 0.42) * d) + 'Z" fill="' + (o.type === 'flow' ? WATER : INK) + '"/>'; }
      if (sel) { s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + ACC + '" stroke-width="7" opacity=".25"/>'; }
      if (name) s += txt((a[0] + b[0]) / 2 - Math.sin(ang) * 12, (a[1] + b[1]) / 2 + Math.cos(ang) * 12 - 2, name, { fs: 11, bg: false, ang: rdAng(ang) });
      if (hit) s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="transparent" stroke-width="22"' + hit + '/>';
      if (sel) s += '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="7" fill="#fff" stroke="' + ACC + '" stroke-width="2"/><circle cx="' + a[0] + '" cy="' + a[1] + '" r="22" fill="transparent" data-hit="oe:' + o.id + ':1"/><circle cx="' + b[0] + '" cy="' + b[1] + '" r="7" fill="#fff" stroke="' + ACC + '" stroke-width="2"/><circle cx="' + b[0] + '" cy="' + b[1] + '" r="22" fill="transparent" data-hit="oe:' + o.id + ':2"/>';
      return s;
    }
    if (sel && (c.k === 'rect' || c.k === 'ellipse') && name) name += ' · ' + fmt(o.w, 2) + ' × ' + fmt(o.h, 2) + ' м';
    var pts = objPts(o).map(S), poly = pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
    var rotDeg = -(o.rot || 0), phase = opt.phase || 'all';
    if (c.k === 'circle' || c.k === 'ellipse') {
      var rx = (c.k === 'circle' ? o.d : o.w) / 2 * k, ry = (c.k === 'circle' ? o.d : o.h) / 2 * k, el = function (f, st, sw, ex) { return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + Math.max(rx, 3) + '" ry="' + Math.max(ry, 3) + '" transform="rotate(' + rotDeg + ' ' + p[0] + ' ' + p[1] + ')" fill="' + f + '" stroke="' + st + '" stroke-width="' + sw + '"' + (ex || '') + '/>'; };
      if (o.type === 'tree') s += el('rgba(62,107,72,.10)', FOREST, 1.4, ds || ' stroke-dasharray="5 3"') + '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="' + FOREST + '"/>';
      else if (o.type === 'trees') { s += el('rgba(62,107,72,.08)', FOREST, 1.4, ds); [[-.4, 0], [0, .25], [.35, -.15]].forEach(function (q) { s += '<circle cx="' + (p[0] + q[0] * rx) + '" cy="' + (p[1] + q[1] * ry) + '" r="' + Math.max(3, Math.min(rx, ry) * .35) + '" fill="none" stroke="' + FOREST + '" stroke-width="1"/>'; }); }
      else if (o.type === 'shrub') s += el('rgba(62,107,72,.06)', FOREST, 1.4, ds || ' stroke-dasharray="1.5 3" stroke-linecap="round"');
      else if (o.type === 'pond') s += el('url(#hhw)', WATER, 1.6, ds);
      else s += el('rgba(41,40,34,.04)', INK, 1.2, ds || ' stroke-dasharray="1.5 3" stroke-linecap="round"');
      if (o.type === 'tree') name += ' ⌀' + fmt(o.d, 1) + ' м';
    } else if (c.k === 'slabs') {
      var a2 = (o.rot || 0) * Math.PI / 180, cs = Math.cos(a2), sn = Math.sin(a2), z = slabSize(o);
      for (var r = 0; r < o.rows; r++) for (var cc = 0; cc < o.cols; cc++) {
        var lx = -z.w / 2 + cc * (o.sw + o.gap), ly = -z.h / 2 + r * (o.sh + o.gap);
        var sp = [[lx, ly], [lx + o.sw, ly], [lx + o.sw, ly + o.sh], [lx, ly + o.sh]].map(function (q) { return S({ x: o.x + q[0] * cs - q[1] * sn, y: o.y + q[0] * sn + q[1] * cs }); });
        s += '<polygon points="' + sp.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ') + '" fill="#ECE8DF" stroke="' + INK + '" stroke-width="1"' + ds + '/>';
      }
      if (!opt.noName) name += ' · ' + (o.rows * o.cols) + ' шт · ' + fmt(z.w, 2) + ' × ' + fmt(z.h, 2) + ' м';
    } else {
      var fill = { road: '#E7E3D8', exhouse: 'url(#hhh2)', neighbor: 'url(#hhh2)', terrace: 'url(#hhd)', temproad: 'none' }[o.type] || '#fff';
      s += '<polygon points="' + poly + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (o.type === 'road' ? 1 : 1.5) + '"' + (o.type === 'temproad' ? ' stroke-dasharray="10 5"' : ds) + '/>';
      if (o.type === 'road') { var la = o.w >= o.h, m1 = la ? [(pts[0][0] + pts[3][0]) / 2, (pts[0][1] + pts[3][1]) / 2] : [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2], m2 = la ? [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2] : [(pts[2][0] + pts[3][0]) / 2, (pts[2][1] + pts[3][1]) / 2]; s += '<line x1="' + m1[0] + '" y1="' + m1[1] + '" x2="' + m2[0] + '" y2="' + m2[1] + '" stroke="#fff" stroke-width="2" stroke-dasharray="12 10"/>'; }
    }
    if (phase === 'base') { if (name) s += txt(p[0], p[1], name, { fs: 11, bg: false, halo: o.type === 'road' ? '#E7E3D8' : '#FAF9F4' }); return s; }
    if (phase === 'top') s = '';
    if (hit) {
      s += '<polygon points="' + poly + '" fill="transparent"' + hit + '/>';
      var bx0 = Math.min.apply(null, pts.map(function (q) { return q[0]; })), bx1 = Math.max.apply(null, pts.map(function (q) { return q[0]; })), by0 = Math.min.apply(null, pts.map(function (q) { return q[1]; })), by1 = Math.max.apply(null, pts.map(function (q) { return q[1]; }));
      if (bx1 - bx0 < 40 || by1 - by0 < 40) { var hw = Math.max(40, bx1 - bx0), hh2 = Math.max(40, by1 - by0); s += '<rect x="' + (p[0] - hw / 2) + '" y="' + (p[1] - hh2 / 2) + '" width="' + hw + '" height="' + hh2 + '" fill="transparent"' + hit + '/>'; }
    }
    if (sel) s += '<polygon points="' + poly + '" fill="rgba(191,81,45,.06)" stroke="' + ACC + '" stroke-width="2" stroke-dasharray="5 3" pointer-events="none"/>';
    if (sel && (c.k === 'rect' || c.k === 'slabs')) objPts(o).forEach(function (q, i) { var sp = S(q); s += '<circle pointer-events="none" cx="' + sp[0] + '" cy="' + sp[1] + '" r="8" fill="#fff" stroke="' + ACC + '" stroke-width="1.5"/><text x="' + sp[0] + '" y="' + (sp[1] + 3.5) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="' + ACC + '">' + (i + 1) + '</text>'; });
    if (sel && ui.tool === 'select' && (c.k === 'rect' || c.k === 'slabs' || c.k === 'ellipse')) {
      var hh = c.k === 'slabs' ? slabSize(o).h : o.h, ar = (o.rot || 0) * Math.PI / 180, ts = S({ x: o.x - Math.sin(ar) * hh / 2, y: o.y + Math.cos(ar) * hh / 2 }), hp = [ts[0] - Math.sin(ar) * 34, ts[1] - Math.cos(ar) * 34];
      s += txt(hp[0], hp[1] - 24, fmt(o.rot || 0, 1) + '°', { fs: 11, fw: 700, c: '#fff', bgc: ACC });
      if (c.k !== 'slabs') { var cc = S({ x: o.x, y: o.y }), c3 = pts[2], dx3 = c3[0] - cc[0], dy3 = c3[1] - cc[1], dl3 = Math.hypot(dx3, dy3) || 1, rh = [c3[0] + dx3 / dl3 * 20, c3[1] + dy3 / dl3 * 20];
        s += '<line x1="' + c3[0] + '" y1="' + c3[1] + '" x2="' + rh[0] + '" y2="' + rh[1] + '" stroke="' + ACC + '" stroke-width="1.5"/><rect x="' + (rh[0] - 7) + '" y="' + (rh[1] - 7) + '" width="14" height="14" rx="2" fill="#fff" stroke="' + ACC + '" stroke-width="2.2"/><path d="M' + (rh[0] - 3) + ' ' + (rh[1] + 3) + 'L' + (rh[0] + 3) + ' ' + (rh[1] - 3) + 'M' + (rh[0]) + ' ' + (rh[1] - 3) + 'H' + (rh[0] + 3) + 'V' + rh[1] + '" fill="none" stroke="' + ACC + '" stroke-width="1.4"/><circle cx="' + rh[0] + '" cy="' + rh[1] + '" r="22" fill="transparent" data-hit="ores:' + o.id + '" style="cursor:nwse-resize"/>'; }
      s += '<line x1="' + ts[0] + '" y1="' + ts[1] + '" x2="' + hp[0] + '" y2="' + hp[1] + '" stroke="' + ACC + '" stroke-width="1.5"/><circle cx="' + hp[0] + '" cy="' + hp[1] + '" r="9" fill="#fff" stroke="' + ACC + '" stroke-width="2.2"/><path d="M' + (hp[0] - 4) + ' ' + (hp[1] - 1) + 'a4 4 0 1 1 1 3" fill="none" stroke="' + ACC + '" stroke-width="1.6"/><circle cx="' + hp[0] + '" cy="' + hp[1] + '" r="22" fill="transparent" data-hit="orot:' + o.id + '" style="cursor:grab"/>';
    }
    if (phase !== 'top' && name) s += txt(p[0], p[1], name, { fs: 11, bg: false, halo: o.type === 'road' ? '#E7E3D8' : '#FAF9F4' });
    return s;
  }

  var DEFS = '<defs><pattern id="hhh" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fff"/><line x1="0" y1="0" x2="0" y2="7" stroke="#292822" stroke-width="1" opacity=".45"/></pattern><pattern id="hhh2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="6" height="6" fill="#fff"/><line x1="0" y1="0" x2="0" y2="6" stroke="#292822" stroke-width=".8" opacity=".3"/></pattern><pattern id="hhd" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><line x1="0" y1="0" x2="6" y2="0" stroke="#292822" stroke-width=".8" opacity=".4"/></pattern><pattern id="hhw" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="16" height="8" fill="#E2EBEE"/><path d="M0 5 Q4 2 8 5 T16 5" fill="none" stroke="#4E6E7A" stroke-width=".8" opacity=".6"/></pattern></defs>';

  function drawScene(doc, V, ui) {
    var W = V.W, H = V.H, k = V.k, pr = ui.mode === 'print';
    var S = function (p) { return [(p.x - V.cx) * k + W / 2, H / 2 - (p.y - V.cy) * k]; };
    var o = [];
    o.push('<svg xmlns="http://www.w3.org/2000/svg" ' + (pr ? 'width="100%"' : 'width="' + W + '" height="' + H + '"') + ' viewBox="0 0 ' + W + ' ' + H + '" font-family="Golos Text, Arial, sans-serif" style="display:block">' + DEFS);
    o.push('<rect width="' + W + '" height="' + H + '" fill="' + (pr ? '#fff' : '#FAF9F4') + '"/>');
    if (!pr) {
      var steps = [0.5, 1, 2, 5, 10, 25, 50, 100], st = 100;
      for (var i = 0; i < steps.length; i++) if (steps[i] * k >= 16) { st = steps[i]; break; }
      var x0 = V.cx - W / 2 / k, x1 = V.cx + W / 2 / k, y0 = V.cy - H / 2 / k, y1 = V.cy + H / 2 / k, g = '';
      for (var gx = Math.ceil(x0 / st) * st; gx <= x1; gx += st) { var sx = S({ x: gx, y: 0 })[0], mj = Math.abs(gx / st / 5 - Math.round(gx / st / 5)) < 1e-6; g += '<line x1="' + sx.toFixed(1) + '" y1="0" x2="' + sx.toFixed(1) + '" y2="' + H + '" stroke="#292822" stroke-opacity="' + (mj ? .12 : .05) + '"/>'; }
      for (var gy = Math.ceil(y0 / st) * st; gy <= y1; gy += st) { var sy = S({ x: 0, y: gy })[1], mj2 = Math.abs(gy / st / 5 - Math.round(gy / st / 5)) < 1e-6; g += '<line x1="0" y1="' + sy.toFixed(1) + '" x2="' + W + '" y2="' + sy.toFixed(1) + '" stroke="#292822" stroke-opacity="' + (mj2 ? .12 : .05) + '"/>'; }
      o.push(g);
      if (doc.underlay && doc.underlay.src) {
        var u = doc.underlay, tl = S({ x: u.x, y: u.y + u.ih * u.mpp });
        o.push('<image href="' + esc(u.src) + '" x="' + tl[0] + '" y="' + tl[1] + '" width="' + (u.iw * u.mpp * k) + '" height="' + (u.ih * u.mpp * k) + '" opacity="' + u.op + '" preserveAspectRatio="none"' + (!u.locked && ui.step === 'parcel' && ui.tool === 'select' ? ' data-hit="ul" style="cursor:move"' : ' pointer-events="none"') + '/>');
      }
    }
    var low = [], high = [];
    doc.objects.forEach(function (ob) { var kk = (OBJ[ob.type] || {}).k; (kk === 'pt' || kk === 'line' || kk === 'text' ? high : low).push(ob); });
    low.forEach(function (ob) { o.push(renderObj(ob, S, k, ui, pr ? {} : { phase: 'base' })); });

    /* участок */
    var P = doc.parcel, pv = P.verts, sg = segs(P);
    if (pv.length) {
      var pts = pv.map(S).map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
      o.push('<' + (P.closed ? 'polygon' : 'polyline') + ' points="' + pts + '" fill="' + (P.closed && !pr ? 'rgba(191,81,45,.035)' : 'none') + '" stroke="' + INK + '" stroke-width="2.2" stroke-dasharray="16 4 3 4" stroke-linejoin="round" pointer-events="none"/>');
      var ccw = polyArea(pv) > 0;
      sg.forEach(function (s) {
        var a = S(s.a), b = S(s.b), ang = Math.atan2(b[1] - a[1], b[0] - a[0]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        var nx = -Math.sin(ang), ny = Math.cos(ang); if (!ccw) { nx = -nx; ny = -ny; }
        var isSel = (ui.sel && ui.sel.k === 'seg' && ui.sel.id === s.key) || ui.pickS === s.key;
        var pick = ui.tool === 'anchorS' || ui.tool === 'alignS';
        if (!pr && (isSel || pick)) o.push('<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + ACC + '" stroke-width="' + (isSel ? 4 : 6) + '" opacity="' + (isSel ? 1 : .35) + '" stroke-linecap="round"/>');
        o.push(txt(mx - nx * 13, my - ny * 13, fmt(s.len) + ' м', { fs: 11, bg: false, ang: rdAng(ang) }));
        var lbl = s.n + (s.label ? ' · ' + s.label : '');
        o.push(txt(mx + nx * 15, my + ny * 15, lbl, { fs: 11, fw: 600, bg: !pr, bgc: '#EFEBE2', ang: rdAng(ang), c: '#4A473F' }));
        if (!pr) o.push('<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="transparent" stroke-width="' + (pick ? 34 : 22) + '" data-hit="seg:' + s.key + '"/>');
      });
      if (P.closed && pv.length > 2) selfX(pv).forEach(function (q) { var p = S(q); o.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" fill="none" stroke="' + ERR + '" stroke-width="2.4"/><text x="' + (p[0] + 14) + '" y="' + (p[1] - 10) + '" font-size="11" font-weight="700" fill="' + ERR + '">пересечение</text>'); });
      if (!pr && (ui.step === 'parcel' || ui.tool === 'p2pT')) pv.forEach(function (v, i) {
        var p = S(v), vs = ui.sel && ui.sel.k === 'v' && ui.sel.id === v.id, first = i === 0 && !P.closed && ui.tool === 'drawParcel';
        o.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (first ? 9 : 6) + '" fill="' + (vs ? ACC : '#fff') + '" stroke="' + (first ? ACC : INK) + '" stroke-width="2"/>');
        o.push('<text x="' + (p[0] + 9) + '" y="' + (p[1] - 9) + '" font-size="10" fill="#6B675C" stroke="#FAF9F4" stroke-width="3" paint-order="stroke">V' + (i + 1) + '</text>');
        o.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="22" fill="transparent" data-hit="v:' + v.id + '" style="cursor:' + (ui.step === 'parcel' ? 'move' : 'pointer') + '"/>');
      });
    }

    /* дом */
    var B = doc.building;
    if (B) {
      var hv = houseWorld(B), hs = hv.map(S), hp = hs.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
      var out = houseOutside(doc), hsel = ui.sel && ui.sel.k === 'house' && !pr;
      o.push('<polygon points="' + hp + '" fill="url(#hhh)" stroke="' + (out ? ERR : INK) + '" stroke-width="2.6" stroke-linejoin="miter"' + (out ? ' stroke-dasharray="8 3"' : '') + (pr ? '' : ' data-hit="house" style="cursor:' + (hsel ? 'move' : 'pointer') + '"') + '/>');
      if (hsel) o.push('<polygon points="' + hp + '" fill="rgba(191,81,45,.07)" stroke="' + ACC + '" stroke-width="1.6" pointer-events="none"/>');
      var cpt = S({ x: B.x, y: B.y });
      var nameSvg = txt(cpt[0], cpt[1] - 8, B.name || 'Дом', { fs: 12, fw: 700, bgc: '#fff' }) + txt(cpt[0], cpt[1] + 12, fmt(B.w) + ' × ' + fmt(B.l) + ' м', { fs: 11, bgc: '#fff' });
      if (out) o.push(txt(cpt[0], cpt[1] + 32, 'выходит за границу участка', { fs: 11, fw: 700, c: ERR, bgc: '#fff' }));
      var hccw = polyArea(hv) > 0, edges = B.shape === 'rect' ? [2, 3] : hv.map(function (_, i) { return i; });
      edges.forEach(function (i) {
        var a = hv[i], b = hv[(i + 1) % hv.length], d = sub(b, a), L = len(d); if (L < 0.05) return;
        var nx = d.y / L, ny = -d.x / L; if (!hccw) { nx = -nx; ny = -ny; }
        var off = 20 / k, a2 = S({ x: a.x + nx * off, y: a.y + ny * off }), b2 = S({ x: b.x + nx * off, y: b.y + ny * off }), sa = S(a), sb = S(b), ang = Math.atan2(b2[1] - a2[1], b2[0] - a2[0]);
        o.push('<path d="M' + sa[0] + ' ' + sa[1] + 'L' + a2[0] + ' ' + a2[1] + 'M' + sb[0] + ' ' + sb[1] + 'L' + b2[0] + ' ' + b2[1] + '" stroke="' + INK + '" stroke-width=".7" opacity=".6"/><line x1="' + a2[0] + '" y1="' + a2[1] + '" x2="' + b2[0] + '" y2="' + b2[1] + '" stroke="' + INK + '" stroke-width="1"/>' + tick(a2[0], a2[1], ang) + tick(b2[0], b2[1], ang));
        o.push(txt((a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2, fmt(L), { fs: 10.5, ang: rdAng(ang), hit: pr ? '' : 'hd', bgc: pr ? '#fff' : '#FAF9F4' }));
      });
      if (!pr && B.shape === 'poly' && ui.step === 'house' && ui.tool === 'select') hv.forEach(function (a, i) {
        var b = hv[(i + 1) % hv.length], d = sub(b, a), L = len(d); if (L < 0.05) return;
        var nx = d.y / L, ny = -d.x / L; if (!hccw) { nx = -nx; ny = -ny; }
        var ms = S({ x: (a.x + b.x) / 2 - nx * 16 / k, y: (a.y + b.y) / 2 - ny * 16 / k }), sa = S(a), sb = S(b), sw = ui.sel && ui.sel.k === 'wall' && ui.sel.i === i, cl = i >= (B.walls || []).length;
        if (sw) o.push('<line x1="' + sa[0] + '" y1="' + sa[1] + '" x2="' + sb[0] + '" y2="' + sb[1] + '" stroke="' + ACC + '" stroke-width="5" stroke-linecap="round"/>');
        o.push('<circle cx="' + ms[0] + '" cy="' + ms[1] + '" r="10" fill="' + (sw ? ACC : '#fff') + '" stroke="' + (sw ? ACC : INK) + '" stroke-width="1.4"' + (cl ? ' stroke-dasharray="3 2"' : '') + '/><text x="' + ms[0] + '" y="' + (ms[1] + 4) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="' + (sw ? '#fff' : INK) + '">' + (i + 1) + '</text><circle cx="' + ms[0] + '" cy="' + ms[1] + '" r="18" fill="transparent" data-hit="hw:' + i + '" style="cursor:pointer"/>');
      });
      if (!pr && ui.tool === 'alignH') hv.forEach(function (a, i) {
        var b = hv[(i + 1) % hv.length], sa = S(a), sb = S(b);
        o.push('<line x1="' + sa[0] + '" y1="' + sa[1] + '" x2="' + sb[0] + '" y2="' + sb[1] + '" stroke="' + ACC + '" stroke-width="6" opacity=".35" stroke-linecap="round"/><line x1="' + sa[0] + '" y1="' + sa[1] + '" x2="' + sb[0] + '" y2="' + sb[1] + '" stroke="transparent" stroke-width="24" data-hit="he:' + i + '" style="cursor:pointer"/>');
      });
      var showLet = pr || ui.step === 'anchors' || doc.anchors.length;
      if (showLet) hv.forEach(function (v, i) {
        var p = S(v), dx = p[0] - cpt[0], dy = p[1] - cpt[1], dl = Math.hypot(dx, dy) || 1, lx = p[0] + dx / dl * 15, ly = p[1] + dy / dl * 15;
        var pick = ui.tool === 'anchorV' || ui.tool === 'p2pV' || ui.tool === 'anchorS', picked = !pr && ui.pickV === v.id;
        if (picked) o.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="17" fill="rgba(191,81,45,.22)" stroke="' + ACC + '" stroke-width="3"/>');
        else if (pick) o.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="12" fill="rgba(191,81,45,.14)" stroke="' + ACC + '" stroke-width="2"/>');
        o.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="' + INK + '"/><text x="' + lx + '" y="' + (ly + 4) + '" text-anchor="middle" font-size="12.5" font-weight="800" fill="' + (pr ? INK : ACC) + '" stroke="' + (pr ? '#fff' : '#FAF9F4') + '" stroke-width="3" paint-order="stroke">' + lt(i) + '</text>');
        if (pick) o.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="26" fill="transparent" data-hit="hv:' + v.id + '" style="cursor:pointer"/>');
      });
      var tie = tiePoints(doc);
      if (showLet) hv.forEach(function (v) {
        var n = tie[v.id]; if (!n) return;
        var p = S(v), dx = p[0] - cpt[0], dy = p[1] - cpt[1], dl = Math.hypot(dx, dy) || 1, bx = p[0] - dx / dl * 15, by = p[1] - dy / dl * 15;
        o.push('<circle cx="' + bx.toFixed(1) + '" cy="' + by.toFixed(1) + '" r="9" fill="' + (pr ? INK : ACC) + '" stroke="#fff" stroke-width="1.6" pointer-events="none"/><text x="' + bx.toFixed(1) + '" y="' + (by + 4).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" pointer-events="none">' + n + '</text>');
      });
      var E = elevInfo(doc);
      if (E && (E.n || (!pr && ui.step === 'slope'))) {
        var marks = E.pts.map(function (p) {
          var sp = S(p), isHi = E.hi && E.hi.id === p.id && E.n >= 2, zs = ui.sel && ui.sel.k === 'corner' && ui.sel.id === p.id && !pr;
          var t = p.raw == null ? p.L + ': ?' : fmt(p.raw, E.dec), w0 = tw(t, 11), ii = hv.findIndex(function (q) { return q.id === p.id; }), pv0 = hv[(ii - 1 + hv.length) % hv.length], nv0 = hv[(ii + 1) % hv.length];
          var e1 = sub(p, pv0), e2 = sub(nv0, p), l1 = len(e1) || 1, l2 = len(e2) || 1, bx = -e1.x / l1 + e2.x / l2, by = -e1.y / l1 + e2.y / l2, bl = Math.hypot(bx, by) || 1; bx /= bl; by /= bl;
          if (!inPoly({ x: p.x + bx * 0.3, y: p.y + by * 0.3 }, hv)) { bx = -bx; by = -by; }
          var sx = Math.abs(bx) < 0.2 ? 0 : (bx > 0 ? 1 : -1), sy = Math.abs(by) < 0.2 ? 0 : (by > 0 ? -1 : 1);
          var lx = sp[0] + sx * (w0 / 2 + 6), ly = sp[1] + sy * 15, tw2 = isHi ? tw('ТОФ', 10.5) : 0;
          var x0 = Math.min(lx - w0 / 2, isHi ? lx + sx * (w0 / 2 + 3) - (sx < 0 ? tw2 : 0) : lx), x1 = Math.max(lx + w0 / 2, isHi ? lx + sx * (w0 / 2 + 3) + (sx >= 0 ? tw2 : 0) : lx);
          return { p: p, t: t, w0: w0, lx: lx, ly: ly, sx: sx || 1, isHi: isHi, zs: zs, tw2: tw2, box: [x0 - 3, ly - 11, x1 + 3, ly + 11] };
        });
        function hvS0() { return hv.map(function (v) { var q = S(v); return { x: q[0], y: q[1] }; }); }
        var hvS = hv.map(function (v) { var q = S(v); return { x: q[0], y: q[1] }; }), outH = function (qx, qy) { return !inPoly({ x: qx, y: qy }, hvS); };
        var obst = marks.map(function (m) { return m.box; }).concat(hv.map(function (v) { var q = S(v), dx = q[0] - cpt[0], dy = q[1] - cpt[1], dl = Math.hypot(dx, dy) || 1, lx = q[0] + dx / dl * 15, ly = q[1] + dy / dl * 15; return [Math.min(q[0], lx) - 9, Math.min(q[1], ly) - 9, Math.max(q[0], lx) + 9, Math.max(q[1], ly) + 9]; }));
        if (E.n >= 2 && E.dropMm > 0) {
          var A1 = S(E.hi), B1 = S(E.lo), vx = B1[0] - A1[0], vy = B1[1] - A1[1], vl = Math.hypot(vx, vy) || 1, ux = vx / vl, uy = vy / vl, ins = Math.min(48, vl * 0.24);
          var a5 = [A1[0] + ux * ins, A1[1] + uy * ins], b5 = [B1[0] - ux * ins, B1[1] - uy * ins], an5 = Math.atan2(uy, ux), dh = 12;
          o.push('<line x1="' + a5[0] + '" y1="' + a5[1] + '" x2="' + b5[0] + '" y2="' + b5[1] + '" stroke="' + INK + '" stroke-width="1.6" pointer-events="none"/><path d="M' + (b5[0] - Math.cos(an5 - 0.4) * dh) + ' ' + (b5[1] - Math.sin(an5 - 0.4) * dh) + 'L' + b5[0] + ' ' + b5[1] + 'L' + (b5[0] - Math.cos(an5 + 0.4) * dh) + ' ' + (b5[1] - Math.sin(an5 + 0.4) * dh) + 'Z" fill="' + INK + '" pointer-events="none"/>');
          var lab5 = 'Уклон ' + E.dropMm + ' мм · ' + fmt(E.pct, 1) + ' % · ' + fmt(E.deg, 1) + '°', labS = E.dropMm + ' мм · ' + fmt(E.deg, 1) + '°', lw5 = tw(lab5, 11), ra = rdAng(an5) * Math.PI / 180, cs5 = Math.cos(ra), sn5 = Math.sin(ra), best = null;
          [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74].forEach(function (tt) { [1, -1, 2, -2].forEach(function (sd) {
            if (best && best.hit === 0) return;
            var cx5 = a5[0] + (b5[0] - a5[0]) * tt + Math.sin(ra) * 13 * sd, cy5 = a5[1] + (b5[1] - a5[1]) * tt - Math.cos(ra) * 13 * sd, lw5 = (best && best.hit > 0 && Math.abs(sd) === 2) ? tw(labS, 11) : tw(lab5, 11), hx5 = Math.abs(cs5) * lw5 / 2 + Math.abs(sn5) * 9, hy5 = Math.abs(sn5) * lw5 / 2 + Math.abs(cs5) * 9, hit = 0;
            for (var q5 = -1; q5 <= 1.0001; q5 += 0.125) [-8, 0, 8].forEach(function (dn) { var qx = cx5 + cs5 * q5 * lw5 / 2 - sn5 * dn, qy = cy5 + sn5 * q5 * lw5 / 2 + cs5 * dn; if (outH(qx, qy)) hit++; obst.forEach(function (bb) { if (qx > bb[0] && qx < bb[2] && qy > bb[1] && qy < bb[3]) hit++; }); });
            if (!best || hit < best.hit) best = { hit: hit, x: cx5, y: cy5, s: lw5 < tw(lab5, 11) };
          }); });
          if (best.hit > 0) { var lwS = tw(labS, 11); [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74, 0.2, 0.8].forEach(function (tt) { [1, -1, 2, -2].forEach(function (sd) { if (best.hit === 0) return; var cx6 = a5[0] + (b5[0] - a5[0]) * tt + Math.sin(ra) * 13 * sd, cy6 = a5[1] + (b5[1] - a5[1]) * tt - Math.cos(ra) * 13 * sd, h6 = 0; for (var q6 = -1; q6 <= 1.0001; q6 += 0.125) [-8, 0, 8].forEach(function (dn) { var qx = cx6 + cs5 * q6 * lwS / 2 - sn5 * dn, qy = cy6 + sn5 * q6 * lwS / 2 + cs5 * dn; if (outH(qx, qy)) h6++; obst.forEach(function (bb) { if (qx > bb[0] && qx < bb[2] && qy > bb[1] && qy < bb[3]) h6++; }); }); if (h6 < best.hit) best = { hit: h6, x: cx6, y: cy6, s: true }; }); }); }
          if (best.hit === 0) o.push(txt(best.x, best.y, best.s ? labS : lab5, { fs: 11, fw: 700, bgc: pr ? '#fff' : '#FAF9F4', ang: rdAng(an5) }));
        }
        marks.forEach(function (m) {
          if (!m.isHi) return;
          var tx0 = m.lx + m.sx * (m.w0 / 2 + m.tw2 / 2 + 3), ty0 = m.ly, bxT = [tx0 - m.tw2 / 2 - 2, ty0 - 10, tx0 + m.tw2 / 2 + 2, ty0 + 10];
          var clash = marks.some(function (n) { if (n === m) return false; var b = n.box; return bxT[0] < b[2] && bxT[2] > b[0] && bxT[1] < b[3] && bxT[3] > b[1]; }) || !inPoly({ x: tx0, y: ty0 }, hvS0());
          if (clash) { var sy0 = m.ly > S(m.p)[1] ? 1 : -1; tx0 = m.lx; ty0 = m.ly + sy0 * 19; }
          m.tx = tx0; m.ty = ty0;
        });
        marks.forEach(function (m) {
          var miss = m.p.raw == null, ask = miss && !pr && ui.step === 'slope';
          o.push(txt(m.lx, m.ly, m.t, { fs: ask ? 12 : 11, fw: 700, c: ask ? ACC : (miss ? ERR : INK), bgc: '#fff', box: m.zs ? ACC : (ask ? ACC : (miss ? ERR : '#9C978B')) }));
          if (!pr && ui.step === 'slope') o.push('<rect x="' + (m.lx - m.w0 / 2 - 12).toFixed(1) + '" y="' + (m.ly - 20).toFixed(1) + '" width="' + (m.w0 + 24).toFixed(1) + '" height="40" fill="transparent" data-hit="hz:' + m.p.id + '" style="cursor:pointer"/>');
          if (m.isHi) o.push(txt(m.tx, m.ty, 'ТОФ', { fs: 10.5, fw: 800, c: '#fff', bgc: ACC }));
        });
      }
      if (!pr && (ui.step === 'house' || ui.step === 'slope') && ui.tool === 'select' && B) hv.forEach(function (v) { var sp = S(v); o.push('<circle cx="' + sp[0] + '" cy="' + sp[1] + '" r="' + (ui.step === 'slope' ? 26 : 16) + '" fill="transparent" data-hit="hz:' + v.id + '" style="cursor:pointer"/>'); });
      if (hsel && ui.tool === 'select') {
        var t0 = hv[2], t1 = hv[3 % hv.length], tm = { x: (t0.x + t1.x) / 2, y: (t0.y + t1.y) / 2 }, a3 = B.angle * Math.PI / 180, rp = S({ x: tm.x - Math.sin(a3) * 40 / k, y: tm.y + Math.cos(a3) * 40 / k }), tms = S(tm);
        o.push('<line x1="' + tms[0] + '" y1="' + tms[1] + '" x2="' + rp[0] + '" y2="' + rp[1] + '" stroke="' + ACC + '" stroke-width="1.5"/><circle cx="' + rp[0] + '" cy="' + rp[1] + '" r="9" fill="#fff" stroke="' + ACC + '" stroke-width="2.2"/><path d="M' + (rp[0] - 4) + ' ' + (rp[1] - 1) + 'a4 4 0 1 1 1 3" fill="none" stroke="' + ACC + '" stroke-width="1.6"/><circle cx="' + rp[0] + '" cy="' + rp[1] + '" r="22" fill="transparent" data-hit="rot" style="cursor:grab"/>');
      }
    }

    /* привязки */
    doc.anchors.forEach(function (an, idx) {
      var inf = anchorInfo(doc, an); if (inf.lost) return;
      var a = S(inf.V), f = S(inf.F), ang = Math.atan2(f[1] - a[1], f[0] - a[0]), sel = ui.sel && ui.sel.k === 'an' && ui.sel.id === an.id && !pr;
      var col = sel ? ACC : INK;
      if (inf.outside && inf.seg) { var e = inf.t < 0 ? S(inf.seg.a) : S(inf.seg.b); o.push('<line x1="' + e[0] + '" y1="' + e[1] + '" x2="' + f[0] + '" y2="' + f[1] + '" stroke="' + INK + '" stroke-width="1" stroke-dasharray="4 3"/>'); }
      o.push('<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + f[0] + '" y2="' + f[1] + '" stroke="' + col + '" stroke-width="' + (an.primary ? 1.3 : 1) + '"' + (an.kind === 'p2p' ? ' stroke-dasharray="6 2 1 2"' : '') + '/>' + tick(a[0], a[1], ang) + tick(f[0], f[1], ang));
      var mx = (a[0] + f[0]) / 2, my = (a[1] + f[1]) / 2, lx = mx + (an.lo ? an.lo.x : 0) * k, ly = my - (an.lo ? an.lo.y : 0) * k;
      if (Math.hypot(lx - mx, ly - my) > 4) o.push('<line x1="' + mx + '" y1="' + my + '" x2="' + lx + '" y2="' + ly + '" stroke="' + INK + '" stroke-width=".7"/><circle cx="' + mx + '" cy="' + my + '" r="1.8" fill="' + INK + '"/>');
      var mism = an.obs && Number.isFinite(an.obs.v) && Math.abs(an.obs.v - inf.dist) > 0.05;
      var who = an.src ? (idx + 1) + ')' : letterOf(doc.building, an.v), to = an.kind === 'p2p' ? 'V' + (doc.parcel.verts.findIndex(function (q) { return q.id === an.t; }) + 1) : (inf.seg ? inf.seg.n : '?');
      var lab = who + '→' + to + ': ' + fmt(inf.dist) + (mism ? ' ≠ замер ' + fmt(an.obs.v) : ''), lang = Math.abs(lx - mx) + Math.abs(ly - my) > 4 ? 0 : rdAng(ang);
      o.push(txt(lx, ly, lab, { fs: pr ? 11.5 : 12.5, fw: 800, c: col, box: mism ? ACC : (sel ? ACC : (pr ? null : '#C9C3B6')), bgc: '#fff', ang: lang }));
      if (!pr) { var hw5 = tw(lab, 12.5) + 24; o.push('<g transform="translate(' + lx.toFixed(1) + ',' + ly.toFixed(1) + ') rotate(' + lang.toFixed(1) + ')"><rect x="' + (-hw5 / 2).toFixed(1) + '" y="-22" width="' + hw5.toFixed(1) + '" height="44" fill="transparent" data-hit="al:' + an.id + '" style="cursor:pointer"/></g>'); }
      if (!pr) o.push('<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + f[0] + '" y2="' + f[1] + '" stroke="transparent" stroke-width="18" data-hit="an:' + an.id + '"/>');
    });
    var oNoHit = !pr && ui.step && ui.step !== 'objects'; /* v3: объекты нажимаются только на шаге «Объекты» */
    if (!pr) low.forEach(function (ob) { o.push(renderObj(ob, S, k, ui, { phase: 'top', noHit: oNoHit })); });
    high.forEach(function (ob) { o.push(renderObj(ob, S, k, ui, { noHit: oNoHit })); });

    if (!pr && (ui.tool === 'anchorV' || ui.tool === 'p2pV')) doc.objects.forEach(function (ob) {
      objAnchors(ob).forEach(function (q) { var p = S(q); o.push('<rect x="' + (p[0] - 6) + '" y="' + (p[1] - 6) + '" width="12" height="12" fill="rgba(78,110,122,.25)" stroke="' + WATER + '" stroke-width="1.8"/><rect x="' + (p[0] - 16) + '" y="' + (p[1] - 16) + '" width="32" height="32" fill="transparent" data-hit="op:' + ob.id + ':' + q.id + '" style="cursor:pointer"/>'); });
    });
    if (!pr && ui.tool === 'lineObj2' && ui.p1) { var p1 = S(ui.p1); o.push('<circle cx="' + p1[0] + '" cy="' + p1[1] + '" r="7" fill="' + ACC + '"/>'); }
    if (!pr && ui.calib) ui.calib.forEach(function (c, i) { var p = S(c); o.push('<path d="M' + (p[0] - 10) + ' ' + p[1] + 'H' + (p[0] + 10) + 'M' + p[0] + ' ' + (p[1] - 10) + 'V' + (p[1] + 10) + '" stroke="' + ACC + '" stroke-width="2"/><text x="' + (p[0] + 10) + '" y="' + (p[1] - 8) + '" font-size="11" font-weight="700" fill="' + ACC + '">' + (i + 1) + '</text>'); });
    o.push('</svg>');
    return o.join('');
  }

  function legendSvg(doc) {
    var rows = [], ref = doc.building ? ({ walls: 'наружные стены', foundation: 'фундамент', other: doc.building.refNote || 'другое' }[doc.building.ref]) : '';
    rows.push({ t: 'Граница участка', f: function (y) { return '<line x1="6" y1="' + y + '" x2="46" y2="' + y + '" stroke="' + INK + '" stroke-width="2.2" stroke-dasharray="16 4 3 4"/>'; } });
    if (doc.building) rows.push({ t: 'Контур дома (' + ref + ')', f: function (y) { return '<rect x="10" y="' + (y - 7) + '" width="32" height="14" fill="url(#hhh)" stroke="' + INK + '" stroke-width="2"/>'; } });
    var EL = elevInfo(doc);
    if (EL && EL.n) rows.push({ t: EL.rod ? 'Отметка угла — отсчёт по рейке, см (меньше — выше)' : 'Высотная отметка угла, м', f: function (y) { return '<rect x="10" y="' + (y - 8) + '" width="32" height="16" rx="3" fill="#fff" stroke="#9C978B"/><text x="26" y="' + (y + 4) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="' + INK + '">' + (EL.rod ? '131,5' : '152,30') + '</text>'; } });
    if (EL && EL.n >= 2) { rows.push({ t: 'ТОФ — точка отсчёта верха фундамента (наивысший угол)', f: function (y) { return '<rect x="12" y="' + (y - 8) + '" width="28" height="16" rx="3" fill="' + ACC + '"/><text x="26" y="' + (y + 4) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="#fff">ТОФ</text>'; } }); rows.push({ t: 'Уклон ' + EL.dropMm + ' мм · ' + fmt(EL.pct, 1) + ' % · ' + fmt(EL.deg, 1) + '° — от угла ' + EL.hi.L + ' к углу ' + EL.lo.L, f: function (y) { return '<line x1="6" y1="' + y + '" x2="40" y2="' + y + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M36 ' + (y - 4) + 'L46 ' + y + 'L36 ' + (y + 4) + 'Z" fill="' + INK + '"/>'; } }); }
    if (doc.anchors.length) rows.push({ t: 'Точка привязки дома (1, 2, 3)', f: function (y) { return '<circle cx="26" cy="' + y + '" r="8" fill="' + INK + '"/><text x="26" y="' + (y + 4) + '" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">1</text>'; } });
    if (doc.anchors.length) rows.push({ t: 'Размер привязки, м (по перпендикуляру)', f: function (y) { return '<line x1="8" y1="' + y + '" x2="44" y2="' + y + '" stroke="' + INK + '" stroke-width="1.3"/>' + tick(8, y, 0) + tick(44, y, 0); } });
    var seen = {};
    doc.objects.forEach(function (ob) {
      if (seen[ob.type] || !OBJ[ob.type] || ob.type === 'label') return; seen[ob.type] = 1;
      rows.push({ t: OBJ[ob.type].n, f: function (y) {
        var c = OBJ[ob.type], fake = { id: 'lg', type: ob.type, status: 'exists', x: 0, y: 0, rot: 0 }, S = function (p) { return [26 + p.x * 4, y - p.y * 4]; };
        if (c.k === 'line') { fake.x = -4.5; fake.x2 = 4.5; fake.y2 = 0; }
        if (c.k === 'rect' || c.k === 'ellipse') { fake.w = 8; fake.h = 3.6; }
        if (c.k === 'circle') fake.d = 3.6;
        if (c.k === 'slabs') { fake.rows = 1; fake.cols = 3; fake.sw = 1.75; fake.sh = 3; fake.gap = 0; }
        return renderObj(fake, S, 4, { mode: 'print' }, { noName: true, noHit: true });
      } });
      if (ob.type === 'slabs') rows[rows.length - 1].t = 'Дорожные плиты 2П30.18, 3,0 × 1,75 м';
    });
    rows.push({ t: 'существует — сплошная линия', f: function (y) { return '<line x1="6" y1="' + y + '" x2="46" y2="' + y + '" stroke="' + INK + '" stroke-width="1.6"/>'; } });
    rows.push({ t: 'планируется — штрих, «(план.)»', f: function (y) { return '<line x1="6" y1="' + y + '" x2="46" y2="' + y + '" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="7 4"/>'; } });
    rows.push({ t: 'неизвестно — пунктир, «(?)»', f: function (y) { return '<line x1="6" y1="' + y + '" x2="46" y2="' + y + '" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="2 4"/>'; } });
    var per = rows.length, rh = 24, H = per * rh + 8, s = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 680 ' + H + '" font-family="Golos Text, Arial, sans-serif" style="display:block">' + DEFS;
    rows.forEach(function (r, i) { var col = i < per ? 0 : 1, y = 14 + (i % per) * rh; s += '<g transform="translate(' + (col * 340) + ',0)">' + r.f(y) + '<text x="58" y="' + (y + 4) + '" font-size="11" fill="' + INK + '">' + esc(r.t) + '</text></g>'; });
    return s + '</svg>';
  }

  /* ---------- Импорт: строгая проверка ---------- */
  function sanitize(raw) {
    if (!raw || typeof raw !== 'object') throw new Error('Это не файл проекта схемы.');
    if (raw.schemaVersion !== 1) throw new Error('Неподдерживаемая версия файла.');
    var d = blankDoc(), bad = function (m) { throw new Error('Файл повреждён: ' + m + '.'); };
    var str = function (v, mx) { return typeof v === 'string' ? v.slice(0, mx || 300) : ''; };
    var fin = function (v, lo, hi, nm) { if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi) bad(nm); return v; };
    var id = function (v) { if (typeof v !== 'string' || !/^[\w-]{1,40}$/.test(v)) bad('идентификатор'); return v; };
    d.projectId = typeof raw.projectId === 'string' ? raw.projectId.slice(0, 40) : d.projectId;
    d.revision = Number.isFinite(raw.revision) ? Math.max(0, Math.floor(raw.revision)) : 0;
    d.createdAt = str(raw.createdAt, 40) || d.createdAt; d.updatedAt = str(raw.updatedAt, 40) || d.updatedAt; d.demo = raw.demo === true;
    var m = raw.meta || {}; Object.keys(d.meta).forEach(function (k) { d.meta[k] = str(m[k], k === 'notes' ? 2000 : 300); });
    var u = raw.util || {}; Object.keys(d.util).forEach(function (k) { var s = u[k] || {}; Object.keys(d.util[k]).forEach(function (f) { d.util[k][f] = str(s[f], 300); }); if (['', 'yes', 'planned', 'no'].indexOf(d.util[k].s) < 0) d.util[k].s = ''; });
    var p = raw.parcel || {}; if (!Array.isArray(p.verts) || p.verts.length > 500) bad('граница участка');
    d.parcel.verts = p.verts.map(function (v) { return { id: id(v.id), x: fin(v.x, -1e5, 1e5, 'координата'), y: fin(v.y, -1e5, 1e5, 'координата') }; });
    d.parcel.closed = p.closed === true && d.parcel.verts.length >= 3; d.parcel.approx = p.approx !== false; d.parcel.source = str(p.source, 10);
    if (p.labels && typeof p.labels === 'object') Object.keys(p.labels).slice(0, 500).forEach(function (k) { if (/^[\w-]{1,40}>[\w-]{1,40}$/.test(k)) d.parcel.labels[k] = str(p.labels[k], 80); });
    var b = raw.building;
    if (b) {
      if (['rect', 'L', 'poly'].indexOf(b.shape) < 0) bad('тип контура');
      d.building = { shape: b.shape, w: fin(b.w, 1, 300, 'ширина дома'), l: fin(b.l, 1, 300, 'длина дома'), cutW: fin(b.cutW == null ? 0 : b.cutW, 0, 300, 'вырез'), cutL: fin(b.cutL == null ? 0 : b.cutL, 0, 300, 'вырез'), corner: ['tr', 'tl', 'br', 'bl'].indexOf(b.corner) >= 0 ? b.corner : 'tr', x: fin(b.x, -1e5, 1e5, 'положение'), y: fin(b.y, -1e5, 1e5, 'положение'), angle: fin(b.angle, -720, 720, 'угол'), ref: ['walls', 'foundation', 'other'].indexOf(b.ref) >= 0 ? b.ref : 'walls', refNote: str(b.refNote, 120), name: str(b.name, 120) };
      if (b.shape === 'poly') {
        if (!Array.isArray(b.walls) || b.walls.length < 2 || b.walls.length > 80) bad('стены дома');
        d.building.walls = b.walls.map(function (w) { return { len: fin(w.len, 0.05, 300, 'длина стены'), turn: fin(w.turn, -180, 180, 'поворот стены') }; });
        d.building.h0 = fin(b.h0 || 0, -360, 360, 'направление');
      }
      d.building.elev = {};
      if (b.elev && typeof b.elev === 'object') Object.keys(b.elev).slice(0, 100).forEach(function (k) { if (/^[\w-]{1,40}$/.test(k) && typeof b.elev[k] === 'number' && Number.isFinite(b.elev[k]) && Math.abs(b.elev[k]) < 1e5) d.building.elev[k] = b.elev[k]; });
    }
    if (!Array.isArray(raw.anchors || []) || (raw.anchors || []).length > 200) bad('привязки');
    d.anchors = (raw.anchors || []).map(function (a) {
      if (['perp', 'p2p'].indexOf(a.kind) < 0) bad('тип привязки');
      var r = { id: id(a.id), kind: a.kind, v: id(a.v), primary: a.primary !== false, lo: { x: 0, y: 0 }, obs: null };
      if (a.kind === 'perp') r.seg = { a: id(a.seg && a.seg.a), b: id(a.seg && a.seg.b) }; else { r.t = id(a.t); r.primary = false; }
      if (a.src != null) { r.src = id(a.src); r.primary = false; }
      if (a.lo) r.lo = { x: fin(a.lo.x, -1e4, 1e4, 'подпись'), y: fin(a.lo.y, -1e4, 1e4, 'подпись') };
      if (a.obs) r.obs = { v: fin(a.obs.v, 0, 1e4, 'замер'), date: str(a.obs.date, 40), src: str(a.obs.src, 120) };
      return r;
    });
    if (!Array.isArray(raw.objects || []) || (raw.objects || []).length > 1000) bad('объекты');
    d.objects = (raw.objects || []).map(function (ob) {
      if (!OBJ[ob.type]) bad('тип объекта');
      var r = newObj(ob.type, fin(ob.x, -1e5, 1e5, 'положение'), fin(ob.y, -1e5, 1e5, 'положение')); r.id = id(ob.id);
      r.name = str(ob.name, 120); r.comment = str(ob.comment, 500); r.status = STATUS[ob.status] ? ob.status : 'exists'; r.rot = fin(ob.rot || 0, -720, 720, 'поворот');
      ['x2', 'y2'].forEach(function (k) { if (k in r) r[k] = fin(ob[k], -1e5, 1e5, 'линия'); });
      ['w', 'h', 'd', 'sw', 'sh'].forEach(function (k) { if (k in r) r[k] = fin(ob[k], 0.05, 1000, 'размер'); });
      ['rows', 'cols'].forEach(function (k) { if (k in r) r[k] = Math.round(fin(ob[k], 1, 40, 'раскладка')); });
      if ('gap' in r) r.gap = fin(ob.gap, 0, 5, 'зазор');
      return r;
    });
    var ul = raw.underlay;
    if (ul) {
      if (typeof ul.src !== 'string' || !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(ul.src) || ul.src.length > 12e6) bad('подложка');
      d.underlay = { src: ul.src, iw: fin(ul.iw, 1, 10000, 'подложка'), ih: fin(ul.ih, 1, 10000, 'подложка'), mpp: fin(ul.mpp, 1e-5, 100, 'масштаб подложки'), x: fin(ul.x, -1e5, 1e5, 'подложка'), y: fin(ul.y, -1e5, 1e5, 'подложка'), op: fin(ul.op, 0, 1, 'прозрачность'), locked: ul.locked === true, calibrated: ul.calibrated === true };
    }
    if (raw.review && typeof raw.review === 'object') d.review = { by: str(raw.review.by, 120), at: str(raw.review.at, 40), rev: Number.isFinite(raw.review.rev) ? raw.review.rev : -1 };
    d.print = { split: !!(raw.print && raw.print.split) };
    return d;
  }

  window.SPCore = { version: 3, SLAB: SLAB, tiePoints: tiePoints, inwardNormal: inwardNormal, segDist: segDist, perpInfo: perp, lt: lt, polyClosure: polyClosure, wallsFromPts: wallsFromPts, tplPts: tplPts, houseDims: houseDims, objAnchors: objAnchors, objPts: objPts, OBJ: OBJ, GROUPS: GROUPS, STATUS: STATUS, UT: UT, LET: LETS, esc: esc, fmt: fmt, num: num, uid: uid, today: today, blankDoc: blankDoc, demoDoc: demoDoc, rectParcel: rectParcel, newBuilding: newBuilding, newObj: newObj, slabSize: slabSize, polyArea: polyArea, segs: segs, findSeg: findSeg, selfX: selfX, inPoly: inPoly, perp: perp, houseLocal: houseLocal, houseWorld: houseWorld, letterOf: letterOf, anchorInfo: anchorInfo, placeByTwo: placeByTwo, houseOutside: houseOutside, bounds: bounds, fitView: fitView, checks: checks, elevInfo: elevInfo, elevText: elevText, drawScene: drawScene, legendSvg: legendSvg, sanitize: sanitize };
})();
