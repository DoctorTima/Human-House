/* Human House — правки модели «Граната» после загрузки:
   фальц по скату, аккуратные вентвыходы, отвод у водосточных труб,
   проход из прихожей в коридор, расстановка мебели (прихожая, гардероб, спальня 1). */
(function () {
  'use strict';
  function islands(o) {
    var geo = o.geometry, p = geo.attributes.position, ix = geo.index, n = p.count, i, par = new Int32Array(n);
    for (i = 0; i < n; i++) par[i] = i;
    var fd = function (a) { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; }, key = new Map();
    for (i = 0; i < n; i++) { var k = p.getX(i).toFixed(3) + ',' + p.getY(i).toFixed(3) + ',' + p.getZ(i).toFixed(3); if (key.has(k)) par[fd(i)] = fd(key.get(k)); else key.set(k, i); }
    if (ix) for (i = 0; i < ix.count; i += 3) { var a = fd(ix.getX(i)), b = fd(ix.getX(i + 1)), c = fd(ix.getX(i + 2)); par[b] = a; par[fd(c)] = a; }
    var C = new Map(), root = new Int32Array(n);
    for (i = 0; i < n; i++) {
      var x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = fd(i); root[i] = r; var bb = C.get(r);
      if (!bb) { bb = [x, x, y, y, z, z, 0]; C.set(r, bb); }
      if (x < bb[0]) bb[0] = x; if (x > bb[1]) bb[1] = x; if (y < bb[2]) bb[2] = y; if (y > bb[3]) bb[3] = y; if (z < bb[4]) bb[4] = z; if (z > bb[5]) bb[5] = z; bb[6]++;
    }
    return { C: C, root: root };
  }
  window.__isl = islands;
  window.__shot = function (px, py, pz, tx, ty, tz, w, h, fov) {
    var g = window.__granat, r = g.r, cam = g.cam.clone();
    cam.fov = fov || 35; cam.aspect = w / h; cam.position.set(px, py, pz); cam.lookAt(tx, ty, tz); cam.updateProjectionMatrix();
    var cw = r.domElement.clientWidth, ch = r.domElement.clientHeight, pr = r.getPixelRatio();
    r.setPixelRatio(1); r.setSize(w, h, false); r.render(g.scene, cam);
    var url = r.domElement.toDataURL('image/png');
    r.setPixelRatio(pr); r.setSize(cw, ch, false); g.redraw();
    var cv = document.getElementById('__shotcv');
    if (!cv) { cv = document.createElement('canvas'); cv.id = '__shotcv'; document.body.appendChild(cv); }
    cv.width = w; cv.height = h; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:' + w + 'px;height:' + h + 'px;display:block';
    var x2 = cv.getContext('2d'), im = new Image(); im.onload = function () { x2.drawImage(im, 0, 0, w, h); }; im.src = url; return url.length;
  };

  /* добавить треугольники (мировые координаты = локальные: у мешей единичные матрицы) */
  function append(mesh, P, N) {
    var g = mesh.geometry, BA = g.attributes.position.constructor, n0 = g.attributes.position.count, k = P.length / 3;
    Object.keys(g.attributes).forEach(function (name) {
      var at = g.attributes[name], sz = at.itemSize, old = at.array, arr = new old.constructor(old.length + k * sz);
      arr.set(old);
      if (name === 'position') arr.set(P, old.length); else if (name === 'normal') arr.set(N, old.length);
      g.setAttribute(name, new BA(arr, sz, at.normalized));
    });
    if (g.index) {
      var oi = g.index.array, ni = new (n0 + k > 65535 ? Uint32Array : oi.constructor)(oi.length + k);
      ni.set(oi); for (var i = 0; i < k; i++) ni[oi.length + i] = n0 + i;
      g.setIndex(new BA(ni, 1));
    }
    if (g.groups.length) g.groups[g.groups.length - 1].count += k;
    g.computeBoundingBox(); g.computeBoundingSphere();
  }
  function tri(P, N, a, b, c, n) { P.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); for (var i = 0; i < 3; i++) N.push(n[0], n[1], n[2]); }
  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  /* усечённый конус вдоль оси от A до B, радиусы r0 → r1; caps: торцы */
  function tube(P, N, A, B, r0, r1, seg, cap0, cap1) {
    var ax = norm([B[0] - A[0], B[1] - A[1], B[2] - A[2]]), t = Math.abs(ax[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    var u = norm(cross(ax, t)), w = cross(ax, u), L = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]), sl = (r0 - r1) / (L || 1);
    var ring = function (C, r, a) { var cs = Math.cos(a), sn = Math.sin(a); return [C[0] + r * (u[0] * cs + w[0] * sn), C[1] + r * (u[1] * cs + w[1] * sn), C[2] + r * (u[2] * cs + w[2] * sn)]; };
    var rn = function (a) { var cs = Math.cos(a), sn = Math.sin(a); return norm([u[0] * cs + w[0] * sn + ax[0] * sl, u[1] * cs + w[1] * sn + ax[1] * sl, u[2] * cs + w[2] * sn + ax[2] * sl]); };
    for (var i = 0; i < seg; i++) {
      var a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2, p00 = ring(A, r0, a0), p01 = ring(A, r0, a1), p10 = ring(B, r1, a0), p11 = ring(B, r1, a1), n0 = rn(a0), n1 = rn(a1);
      P.push.apply(P, p00.concat(p01, p11, p00, p11, p10)); N.push.apply(N, n0.concat(n1, n1, n0, n1, n0));
      if (cap0 && r0 > 0) tri(P, N, A, p01, p00, [-ax[0], -ax[1], -ax[2]]);
      if (cap1 && r1 > 0) tri(P, N, B, p10, p11, ax);
    }
  }
  function collapse(mesh, sel) { var p = mesh.geometry.attributes.position, first = {}; for (var i = 0; i < p.count; i++) { var r = sel(i); if (r == null) continue; if (!(r in first)) first[r] = [p.getX(i), p.getY(i), p.getZ(i)]; var f = first[r]; p.setXYZ(i, f[0], f[1], f[2]); } p.needsUpdate = true; }

  var LOG = [];
  function step(name, fn) { try { var r = fn(); LOG.push(name + ': ' + (r == null ? 'ok' : r)); } catch (e) { LOG.push(name + ': ОШИБКА ' + e.message); console.warn('[Гранат] ' + name, e); } }

  window.__granatFix = function (root) {
    var get = function (n) { return root.children.filter(function (c) { return c.name === n; })[0]; };
    root.updateMatrixWorld(true);

    /* 1. Фальц: швы вдоль ската на всех плоскостях кровли, включая вальмы */
    step('кровля', function () {
      var done = 0;
      ['RoofOriginal__roof', 'RoofAlternate__roof'].forEach(function (nm) {
        var m = get(nm); if (!m || !m.geometry.attributes.uv) return;
        if (m.geometry.index) m.geometry = m.geometry.toNonIndexed();
        var p = m.geometry.attributes.position, uv = m.geometry.attributes.uv;
        for (var t = 0; t < p.count; t += 3) {
          var A = [p.getX(t), p.getY(t), p.getZ(t)], B = [p.getX(t + 1), p.getY(t + 1), p.getZ(t + 1)], Cc = [p.getX(t + 2), p.getY(t + 2), p.getZ(t + 2)];
          var e1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], e2 = [Cc[0] - A[0], Cc[1] - A[1], Cc[2] - A[2]], n = norm(cross(e1, e2));
          if (Math.abs(n[1]) > 0.985) continue;
          var ds = norm([n[0] * n[1], n[1] * n[1] - 1, n[2] * n[1]]);
          var du1 = uv.getX(t + 1) - uv.getX(t), dv1 = uv.getY(t + 1) - uv.getY(t), du2 = uv.getX(t + 2) - uv.getX(t), dv2 = uv.getY(t + 2) - uv.getY(t), det = du1 * dv2 - du2 * dv1;
          if (Math.abs(det) < 1e-9) continue;
          var Pu = norm([(e1[0] * dv2 - e2[0] * dv1) / det, (e1[1] * dv2 - e2[1] * dv1) / det, (e1[2] * dv2 - e2[2] * dv1) / det]);
          var Pv = norm([(-e1[0] * du2 + e2[0] * du1) / det, (-e1[1] * du2 + e2[1] * du1) / det, (-e1[2] * du2 + e2[2] * du1) / det]);
          var cu = Math.abs(Pu[0] * ds[0] + Pu[1] * ds[1] + Pu[2] * ds[2]), cv = Math.abs(Pv[0] * ds[0] + Pv[1] * ds[1] + Pv[2] * ds[2]);
          if (cu > cv + 0.05) { for (var j = 0; j < 3; j++) { var u0 = uv.getX(t + j); uv.setXY(t + j, uv.getY(t + j), u0); } done++; }
        }
        uv.needsUpdate = true;
      });
      return 'повёрнуто граней ' + done;
    });

    /* 2. Вентвыходы: вместо гранёных «пик» — труба Ø110, проходной элемент и колпак-грибок */
    step('вентвыходы', function () {
      var made = 0;
      ['RoofOriginal__trim', 'RoofAlternate__trim'].forEach(function (nm) {
        var m = get(nm); if (!m) return;
        var I = islands(m), bodies = [], plates = [];
        I.C.forEach(function (b, r) {
          var sx = b[1] - b[0], sz = b[5] - b[4], sy = b[3] - b[2];
          if (b[2] < 3.4 || sx > 0.45 || sz > 0.45) return;
          if (sy > 0.3) bodies.push({ r: r, b: b }); else if (sy < 0.03 && sx > 0.2 && sz > 0.2) plates.push({ r: r, b: b });
        });
        if (!bodies.length) return;
        var kill = {}; bodies.forEach(function (o) { kill[o.r] = 1; }); plates.forEach(function (o) { kill[o.r] = 1; });
        collapse(m, function (i) { var r = I.root[i]; return kill[r] ? r : null; });
        var P = [], N = [];
        bodies.forEach(function (o) {
          var b = o.b, cx = (b[0] + b[1]) / 2, cz = (b[4] + b[5]) / 2, yf = b[2] + 0.06;
          plates.forEach(function (q) { var pb = q.b; if (cx > pb[0] && cx < pb[1] && cz > pb[4] && cz < pb[5]) yf = (pb[2] + pb[3]) / 2; });
          tube(P, N, [cx, yf - 0.12, cz], [cx, yf + 0.07, cz], 0.105, 0.075, 24, false, true);
          tube(P, N, [cx, yf + 0.07, cz], [cx, yf + 0.46, cz], 0.056, 0.056, 24, false, false);
          tube(P, N, [cx, yf + 0.46, cz], [cx, yf + 0.50, cz], 0.04, 0.04, 16, false, false);
          tube(P, N, [cx, yf + 0.50, cz], [cx, yf + 0.53, cz], 0.12, 0.12, 24, true, false);
          tube(P, N, [cx, yf + 0.53, cz], [cx, yf + 0.61, cz], 0.12, 0.0, 24, false, false);
          made++;
        });
        append(m, P, N);
      });
      return 'заменено ' + made;
    });

    /* 3. Водосточные трубы: отвод 45° внизу, выпуск над отмосткой */
    step('водостоки', function () {
      var m = get('Base__metalwork'); if (!m) return 'нет';
      var I = islands(m), p = m.geometry.attributes.position, pipes = [];
      I.C.forEach(function (b, r) { if (b[3] - b[2] > 1.5 && b[2] < 0.5) pipes.push({ r: r, b: b }); });
      var P = [], N = [], cut = 0.6;
      pipes.forEach(function (o) {
        var sx = 0, sz = 0, n = 0, mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
        for (var i = 0; i < p.count; i++) { if (I.root[i] !== o.r || p.getY(i) > 1.2) continue; var x = p.getX(i), z = p.getZ(i); sx += x; sz += z; n++; if (x < mnx) mnx = x; if (x > mxx) mxx = x; if (z < mnz) mnz = z; if (z > mxz) mxz = z; }
        if (!n) return;
        var cx = (mnx + mxx) / 2, cz = (mnz + mxz) / 2, rad = Math.max(mxx - mnx, mxz - mnz) / 2;
        for (var j = 0; j < p.count; j++) if (I.root[j] === o.r && p.getY(j) < cut) p.setY(j, cut);
        var dW = [Math.abs(cx + 5.7), Math.abs(cx - 5.75), Math.abs(cz + 5.25), Math.abs(cz - 5.18)], k = dW.indexOf(Math.min.apply(null, dW));
        var d = [[-1, 0], [1, 0], [0, -1], [0, 1]][k], L = 0.2;
        tube(P, N, [cx, cut + 0.04, cz], [cx + d[0] * 0.05, cut - 0.06, cz + d[1] * 0.05], rad, rad, 16, false, false);
        tube(P, N, [cx + d[0] * 0.05, cut - 0.06, cz + d[1] * 0.05], [cx + d[0] * (0.05 + L), cut - 0.06 - L, cz + d[1] * (0.05 + L)], rad, rad * 1.08, 16, false, false);
      });
      p.needsUpdate = true;
      append(m, P, N);
      return 'труб ' + pipes.length;
    });

    /* 4. Проход из прихожей в коридор: стена между ними остаётся только перемычкой над проёмом */
    step('проход', function () {
      var X0 = -0.535, X1 = 1.286, Z0 = 0.958, Z1 = 1.09, H = 2.58, total = 0;
      var inBox = function (p, i) { var x = p.getX(i), z = p.getZ(i); return x >= X0 && x <= X1 && z >= Z0 && z <= Z1; };
      root.children.forEach(function (m) {
        if (!m.isMesh || !/^(Base__|CutCaps__)/.test(m.name) || m.name === 'Base__floor') return;
        var g = m.geometry;
        if (g.index) { var pp = g.attributes.position, ii = g.index, any = false; for (var s = 0; s < ii.count && !any; s += 3) if (inBox(pp, ii.getX(s)) && inBox(pp, ii.getX(s + 1)) && inBox(pp, ii.getX(s + 2)) && Math.min(pp.getY(ii.getX(s)), pp.getY(ii.getX(s + 1)), pp.getY(ii.getX(s + 2))) < H - 0.01) any = true; if (!any) return; m.geometry = g = g.toNonIndexed(); }
        var p = g.attributes.position, clamp = m.name === 'Base__wall' || m.name === 'Base__edge', hit = 0;
        for (var t = 0; t < p.count; t += 3) {
          if (!inBox(p, t) || !inBox(p, t + 1) || !inBox(p, t + 2)) continue;
          var my = Math.min(p.getY(t), p.getY(t + 1), p.getY(t + 2));
          if (my > H - 0.01) continue;
          if (clamp) { for (var j = 0; j < 3; j++) if (p.getY(t + j) < H) p.setY(t + j, H); }
          else { var x = p.getX(t), y = p.getY(t), z = p.getZ(t); for (var q = 1; q < 3; q++) p.setXYZ(t + q, x, y, z); }
          hit++;
        }
        if (hit) { p.needsUpdate = true; g.computeBoundingSphere(); total += hit; }
      });
      var w = get('Base__wall'); if (w) { var P = [], N = [], dn = [0, -1, 0]; tri(P, N, [-0.532, H, 0.964], [1.283, H, 0.964], [1.283, H, 1.084], dn); tri(P, N, [-0.532, H, 0.964], [1.283, H, 1.084], [-0.532, H, 1.084], dn); append(w, P, N); }
      return 'граней ' + total;
    });

    /* 5. Мебель */
    var furn = root.children.filter(function (c) { return /^Furniture__/.test(c.name); }).map(function (m) { return { m: m, I: islands(m) }; });
    function pick(bb) {
      var e = 0.03, out = [];
      furn.forEach(function (f) { var rs = {}; f.I.C.forEach(function (b, r) { if (b[0] >= bb[0] - e && b[1] <= bb[1] + e && b[2] >= bb[2] - e && b[3] <= bb[3] + e && b[4] >= bb[4] - e && b[5] <= bb[5] + e) rs[r] = 1; }); out.push({ f: f, rs: rs }); });
      return out;
    }
    function each(sel, fn) {
      var n = 0;
      sel.forEach(function (s) { var g = s.f.m.geometry, p = g.attributes.position, nr = g.attributes.normal, hit = 0; for (var i = 0; i < p.count; i++) if (s.rs[s.f.I.root[i]]) { fn(p, nr, i); hit++; } if (hit) { p.needsUpdate = true; if (nr) nr.needsUpdate = true; g.computeBoundingSphere(); n += hit; } });
      return n;
    }
    step('прихожая: банкетка у входной двери убрана', function () {
      var s = pick([-0.25, 0.89, 0.5, 1.1, 2.45, 3.19]), f = {};
      return each(s, function (p, nr, i) { var k = s.indexOf(s.filter(function (q) { return q.f.m.geometry.attributes.position === p; })[0]); if (!f[k]) f[k] = [p.getX(i), p.getY(i), p.getZ(i)]; p.setXYZ(i, f[k][0], f[k][1], f[k][2]); }) + ' верш.';
    });
    step('гардероб: второй шкаф убран, проход 0,8 м', function () {
      var s = pick([-0.86, -0.44, 0.5, 2.66, 1.28, 2.98]), f = {};
      return each(s, function (p, nr, i) { var k = s.indexOf(s.filter(function (q) { return q.f.m.geometry.attributes.position === p; })[0]); if (!f[k]) f[k] = [p.getX(i), p.getY(i), p.getZ(i)]; p.setXYZ(i, f[k][0], f[k][1], f[k][2]); }) + ' верш.';
    });
    step('спальня 1: шкаф сдвинут от двери', function () {
      return each(pick([-1.18, 0.42, 0.5, 2.66, -1.27, -0.8]), function (p, nr, i) { p.setX(i, p.getX(i) + 1.0); }) + ' верш.';
    });
    step('спальня 1: картины перенесены с окна над изголовье', function () {
      var moves = [[[-0.78, -0.32, 1.6, 2.27, -4.74, -4.68], -3.44], [[-0.18, 0.28, 1.6, 2.27, -4.74, -4.68], -2.86]], n = 0;
      moves.forEach(function (mv) {
        var b = mv[0], cx = (b[0] + b[1]) / 2, cz = (b[4] + b[5]) / 2, nx = -1.665, nz = mv[1];
        n += each(pick(b), function (p, nr, i) {
          var dx = p.getX(i) - cx, dz = p.getZ(i) - cz; p.setX(i, nx + dz); p.setZ(i, nz - dx);
          if (nr) { var ax = nr.getX(i), az = nr.getZ(i); nr.setX(i, az); nr.setZ(i, -ax); }
        });
      });
      return n + ' верш.';
    });
    window.__granatFixLog = LOG;
  };
})();
