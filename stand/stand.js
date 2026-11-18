/* Human House · павильон Open Village 2027. Один экземпляр model-viewer, модели — из models.json. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var mv = $('mv'), stage = $('stage'), poster = $('poster'), seg = $('seg'), cap = $('cap'), hint = $('hint'), chip = $('chip');
  var VIEWS = ['lcd', 'led', 'frame'];
  var FALLBACK = { lcd: { label: 'LCD', poster: 'images/lcd.webp', screenMeters: [2.17, 1.22] }, led: { label: 'LED', poster: 'images/led.webp', screenMeters: [3.2, 1.8] }, frame: { label: 'Каркас', poster: 'images/frame.webp', screenMeters: null } };
  var CAPTION = { frame: 'Фанерные короба, деревянное усиление и отдельная опора экрана' };
  var manifestUrl = new URL(document.querySelector('meta[name="hh-assets"]').content, location.href);
  var M = null, cur = null, token = 0, readyOnce = false, savedCam = null, initCam = null;

  var ua = navigator.userAgent || '';
  var isIPadDesk = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  var isIOS = /iPhone|iPad|iPod/.test(ua) || isIPadDesk;
  var isAndroid = /Android/i.test(ua);
  var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  var mobile = isIOS || isAndroid || coarse;
  var inApp = /Telegram|Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Line\/|VKClient|vkontakte|MicroMessenger|YaBrowser\/.*Mobile.*SA\//i.test(ua) || (isIOS && !/Safari\//.test(ua) && /AppleWebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua));
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) mv.setAttribute('interpolation-decay', '20');

  function fmt(n) { return String(n.toFixed(2)).replace('.', ','); }
  function abs(p) { return new URL(p, manifestUrl).href; }
  function viewFromUrl() { var v = new URLSearchParams(location.search).get('view'); return VIEWS.indexOf(v) >= 0 ? v : 'lcd'; }
  function shareUrl(v) { var u = new URL(location.href); u.hash = ''; u.searchParams.set('view', v || cur); return u.href; }
  function variant(v) { return (M && M.variants[v]) || FALLBACK[v]; }
  function toast(t) { var el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { el.hidden = true; }, 2400); }
  function showHint(html) { if (!html) { hint.hidden = true; hint.innerHTML = ''; return; } hint.innerHTML = html; hint.hidden = false; }
  function caption(v) {
    var d = variant(v);
    if (v === 'frame') return '<b>Каркас</b> · ' + CAPTION.frame;
    return '<b>' + d.label + '</b> · экран ' + fmt(d.screenMeters[0]) + ' × ' + fmt(d.screenMeters[1]) + ' м' + (v === 'led' ? ' — во всю заднюю стену' : '');
  }
  function setSeg(v) {
    [].forEach.call(seg.querySelectorAll('[role=radio]'), function (b) { var on = b.dataset.v === v; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
  }
  function progress(p) { $('barFill').style.width = Math.round(p * 100) + '%'; chip.textContent = 'Загрузка модели · ' + Math.round(p * 100) + '%'; }

  /* ---------- WebGL ---------- */
  function hasWebGL() { try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
  var gl = hasWebGL();

  /* ---------- выбор версии ---------- */
  function select(v, opts) {
    opts = opts || {};
    if (VIEWS.indexOf(v) < 0) v = 'lcd';
    var same = v === cur && !opts.force;
    cur = v; setSeg(v); cap.innerHTML = caption(v);
    if (!opts.noHistory) { var u = new URL(location.href); u.searchParams.set('view', v); history.replaceState(null, '', u.href); }
    var d = variant(v);
    poster.src = M ? abs(d.poster) : new URL('assets/hh-stand-v4/' + d.poster, location.href).href;
    poster.alt = 'Стенд Human House, версия ' + d.label;
    if (!M || !gl) return;
    if (same) return;
    var my = ++token;
    if (readyOnce) savedCam = { orbit: mv.getCameraOrbit(), target: mv.getCameraTarget(), fov: mv.getFieldOfView() };
    $('err').hidden = true;
    stage.classList.add('loading'); if (!readyOnce) stage.classList.remove('ready');
    chip.hidden = false; progress(0);
    mv.poster = abs(d.poster);
    mv.setAttribute('ios-src', abs(d.iosSrc));
    mv.src = abs(d.src);
    $('arLink').href = abs(d.iosSrc) + '#allowsContentScaling=0';
    mv._hhToken = my;
  }

  mv.addEventListener('progress', function (e) { if (mv._hhToken !== token) return; progress(e.detail.totalProgress || 0); });
  mv.addEventListener('load', function () {
    if (mv._hhToken !== token) return;
    stage.classList.remove('loading'); stage.classList.add('ready'); chip.hidden = true;
    if (!initCam) initCam = { orbit: mv.getAttribute('camera-orbit'), target: mv.getAttribute('camera-target'), fov: mv.getAttribute('field-of-view') };
    if (savedCam) {
      var o = savedCam.orbit, t = savedCam.target;
      mv.cameraOrbit = o.theta + 'rad ' + o.phi + 'rad ' + o.radius + 'm';
      mv.cameraTarget = t.x + 'm ' + t.y + 'm ' + t.z + 'm';
      mv.fieldOfView = savedCam.fov + 'deg';
      mv.jumpCameraToGoal();
    }
    readyOnce = true;
    updateAr();
  });
  mv.addEventListener('error', function (e) {
    if (mv._hhToken !== token) return;
    stage.classList.remove('loading'); chip.hidden = true;
    var d = variant(cur);
    $('errText').textContent = 'Модель «' + d.label + '» не загрузилась. Фото стенда — выше и ниже; ссылку можно открыть на другом устройстве.';
    $('errPath').textContent = abs(d.src);
    $('err').hidden = false;
  });
  $('retry').addEventListener('click', function () { if (!M) { boot(); return; } select(cur, { force: true, noHistory: true }); });

  /* клавиатура для переключателя */
  seg.addEventListener('click', function (e) { var b = e.target.closest('[data-v]'); if (b) select(b.dataset.v); });
  seg.addEventListener('keydown', function (e) {
    var i = VIEWS.indexOf(cur), n = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = VIEWS[(i + 1) % 3];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = VIEWS[(i + 2) % 3];
    else if (e.key === 'Home') n = VIEWS[0]; else if (e.key === 'End') n = VIEWS[2];
    if (!n) return; e.preventDefault(); select(n); seg.querySelector('[data-v="' + n + '"]').focus();
  });

  $('resetBtn').addEventListener('click', function () {
    if (!initCam || !readyOnce) return;
    mv.cameraOrbit = initCam.orbit; mv.cameraTarget = initCam.target; mv.fieldOfView = initCam.fov;
    if (reduce) mv.jumpCameraToGoal();
  });

  /* ---------- AR ---------- */
  var quickLookAnchor = (function () { try { return document.createElement('a').relList.supports('ar'); } catch (e) { return false; } })();
  function updateAr() {
    var can = !!mv.canActivateAR;
    $('arBtn').hidden = !(mobile && (can || (isIOS && quickLookAnchor) || isAndroid || inApp));
    $('phoneBtn').hidden = mobile;
    if (inApp) showHint('Чтобы поставить стенд на пол, откройте ссылку в <b>' + (isIOS ? 'Safari' : 'Chrome') + '</b>: меню «⋯» → «Открыть в браузере». 3D работает и здесь.');
  }
  $('arBtn').addEventListener('click', function () {
    var d = variant(cur);
    $('daT').textContent = 'Найдите свободный участок пола 4 × 3 м';
    $('arNote').textContent = 'Откроется стенд «' + d.label + '» в реальном размере: 4 м по фасаду, 3 м в глубину, 3 м в высоту. Медленно поведите камерой по полу, пока он не определится.';
    $('dlgAr').showModal();
  });
  $('arGo').addEventListener('click', function () {
    $('dlgAr').close();
    if (inApp) { showHint('Встроенный браузер мессенджера не запускает AR. Откройте ссылку в <b>' + (isIOS ? 'Safari' : 'Chrome') + '</b> — модель останется той же: ' + variant(cur).label + '.'); return; }
    if (mv.canActivateAR) { try { mv.activateAR(); return; } catch (e) {} }
    if (isIOS && quickLookAnchor) { $('arLink').click(); return; }
    arFail();
  });
  function arFail(reason) {
    var t = isAndroid ? 'AR не запустился на этом телефоне: нужны камера и сервисы Google Play для AR (ARCore). 3D-модель продолжает работать — её можно крутить и приближать.' :
      isIOS ? 'AR не запустился. Нужен iPhone или iPad с iOS 12+ и Safari. 3D-модель продолжает работать.' : 'На этом устройстве AR недоступен. 3D-модель продолжает работать.';
    showHint(t + (reason ? ' <span style="opacity:.7">(' + reason + ')</span>' : ''));
  }
  mv.addEventListener('ar-status', function (e) {
    var s = e.detail && e.detail.status;
    if (s === 'failed') arFail('отказ в камере или ошибка запуска');
    if (s === 'session-started') showHint('');
  });

  /* ---------- ссылка, QR, поделиться ---------- */
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, bad) { try { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); var r = document.execCommand('copy'); ta.remove(); r ? ok() : bad(); } catch (e) { bad(e); } });
  }
  function manual(url) { var i = $('urlShare'); i.value = url; $('dlgShare').showModal(); i.focus(); i.select(); }
  $('shareTop').addEventListener('click', function () {
    var url = shareUrl(), d = variant(cur);
    if (navigator.share && mobile) { navigator.share({ title: 'Павильон Human House · ' + d.label, text: 'Стенд Human House на Open Village 2027 — 3D и AR', url: url }).catch(function (e) { if (e && e.name !== 'AbortError') copy(url).then(function () { toast('Ссылка скопирована'); }, function () { manual(url); }); }); return; }
    copy(url).then(function () { toast('Ссылка на версию «' + d.label + '» скопирована'); }, function () { manual(url); });
  });
  $('phoneBtn').addEventListener('click', function () {
    var url = shareUrl();
    $('urlPhone').value = url;
    var box = $('qr');
    if (window.qrcode) { var q = window.qrcode(0, 'M'); q.addData(url); q.make(); box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }
    else box.textContent = 'QR не загрузился — скопируйте ссылку ниже';
    $('dlgPhone').showModal();
  });
  $('copyPhone').addEventListener('click', function () { var i = $('urlPhone'); copy(i.value).then(function () { toast('Ссылка скопирована'); }, function () { i.focus(); i.select(); }); });

  /* ---------- детали ---------- */
  function details() {
    var list = (M && M.details) || [{ label: 'Стойка с образцами', src: 'images/detail-blocks.webp' }, { label: 'Полки со стороны сотрудника', src: 'images/detail-staff.webp' }, { label: 'Обзор сбоку', src: 'images/detail-side.webp' }];
    $('grid').innerHTML = list.map(function (d) { var s = M ? abs(d.src) : new URL('assets/hh-stand-v4/' + d.src, location.href).href; return '<figure><img src="' + s + '" alt="' + d.label + '" loading="lazy" decoding="async" width="1050" height="750"><figcaption>' + d.label + '</figcaption></figure>'; }).join('');
  }

  /* ---------- старт ---------- */
  function boot() {
    $('err').hidden = true;
    fetch(manifestUrl.href, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (j) {
      M = j; details();
      if (!gl) { stage.classList.add('ready'); poster.style.opacity = '1'; showHint('Браузер не поддерживает 3D (WebGL). Показаны фото стенда. Откройте ссылку на другом устройстве — она сохранит выбранную версию.'); $('phoneBtn').hidden = mobile; return; }
      var start = function () { select(cur, { force: true, noHistory: true }); };
      if (customElements.get('model-viewer')) start(); else customElements.whenDefined('model-viewer').then(start);
    }).catch(function (e) {
      stage.classList.remove('loading'); chip.hidden = true;
      $('errText').textContent = 'Не удалось прочитать каталог моделей. Проверьте, что он выложен на сервере.';
      $('errPath').textContent = manifestUrl.href + ' — ' + (e && e.message || e);
      $('err').hidden = false;
    });
  }
  cur = viewFromUrl(); select(cur, { noHistory: true }); details();
  $('phoneBtn').hidden = mobile;
  if (mobile) $('arBtn').hidden = false;
  if (inApp) updateAr();
  boot();
  window.addEventListener('popstate', function () { select(viewFromUrl(), { noHistory: true }); });
})();
