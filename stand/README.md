# Павильон Human House · Open Village 2027 — страница `/open-village/stand/`

Готовая статическая страница. Всё грузится с вашего домена: HTML, JS, шрифты Golos Text, model-viewer, QR-генератор, модели и картинки. Внешних CDN, ключей и сервисов нет.

## Что внутри

```
open-village/stand/
  index.html                  страница
  stand.js                    логика: выбор версии, загрузка, AR, ссылки, QR
  .htaccess                   MIME-типы и кэш (Apache)
  fonts/                      Golos Text 400/600/800, кириллица и латиница
  img/hh-logo.png             логотип сайта
  img/og-stand.jpg            превью для мессенджеров, 1200 × 630
  vendor/model-viewer.min.js  @google/model-viewer, самохостинг (Apache-2.0)
  vendor/qrcode-generator-1.4.4.js  QR без внешних сервисов (MIT)
  assets/hh-stand-v4/         каталог моделей — оба ZIP, объединены
    models.json               манифест: пути к файлам — относительно него
    HH_OpenSides_LCD.glb / .usdz
    HH_OpenSides_LED.glb / .usdz
    HH_Frame.glb / .usdz
    images/                   постеры lcd/led/frame + 3 детали
```

Модели, текстуры и масштаб не изменены — файлы взяты из архивов как есть.

## Куда положить

1. Скопируйте папку `stand` целиком в корень сайта так, чтобы получилось `https://ВАШ-ДОМЕН/open-village/stand/index.html`.
2. Каталог моделей уже лежит внутри: `/open-village/stand/assets/hh-stand-v4/`. Ничего настраивать не нужно.
3. Если модели будут жить в другом месте (например, на CDN или отдельном поддомене) — поменяйте одну строку в `index.html`:
   ```html
   <meta name="hh-assets" content="assets/hh-stand-v4/models.json">
   ```
   на полный адрес манифеста, например `https://static.ВАШ-ДОМЕН/hh-stand-v4/models.json`. Все пути к GLB/USDZ/картинкам считаются от адреса манифеста.

Ссылка без слэша `/open-village/stand` сама перенаправляет на `/open-village/stand/`.

**Если сайт на Тильде.** Тильда не принимает бинарные файлы и папки, поэтому страницу нужно выложить на любой статический хостинг на вашем домене или поддомене (например `stand.humhouse.ru` или GitHub Pages с вашим доменом). Открывайте её как отдельную страницу, не внутри iframe Тильды — AR из iframe на iPhone не запускается.

## Настройка сервера

- HTTPS обязателен (AR и копирование ссылки без него не работают).
- MIME-типы: `.glb` → `model/gltf-binary`, `.usdz` → `model/vnd.usdz+zip`. Для Apache — уже в `.htaccess`. Для nginx:
  ```nginx
  types { model/gltf-binary glb; model/vnd.usdz+zip usdz; }
  location /open-village/stand/assets/ { add_header Access-Control-Allow-Origin *; add_header Cache-Control "public, max-age=604800"; }
  ```
- Файлы должны отдаваться напрямую: без авторизации, без `Content-Disposition: attachment`, без HTML-заглушек и временных токенов.
- Если модели на другом домене — нужен CORS `Access-Control-Allow-Origin` для `.glb` и `.json`; `.usdz` должен быть публично доступен.
- Превью в мессенджерах: в `index.html` поменяйте `og:image` на абсолютный адрес, например `https://ВАШ-ДОМЕН/open-village/stand/img/og-stand.jpg` — часть мессенджеров не понимает относительный путь.

## Ссылки

- `/open-village/stand/` или `?view=lcd` — LCD (по умолчанию)
- `?view=led` — LED
- `?view=frame` — каркас
- Неизвестное значение → LCD. «Поделиться», копирование и QR передают выбранную версию.

## Как работает

- Сразу показывается постер выбранной версии; загружается только её GLB (LCD/LED ≈ 8 МБ, каркас ≈ 2,6 МБ). USDZ не скачивается при обычном просмотре — только при запуске AR на iPhone/iPad.
- Переключение LCD/LED/каркас — без перезагрузки, ракурс сохраняется. Быстрые нажатия — показывается последний выбор.
- AR: iPhone/iPad — Apple Quick Look (USDZ, масштаб 1:1 зафиксирован); Android — WebXR или Google Scene Viewer (GLB). Перед запуском — подсказка «Найдите свободный участок пола 4 × 3 м». iPad в режиме настольного сайта распознаётся как планшет.
- На компьютере вместо AR — «Открыть на телефоне»: QR текущей ссылки и копирование.
- Во встроенных браузерах Telegram/WhatsApp/Instagram/VK — подсказка открыть ссылку в Safari/Chrome.
- Без WebGL или при ошибке загрузки остаются постер, фото, «Повторить» и рабочая ссылка.

## Приёмка — что проверить после выкладки

Проверено в превью (настольный Chromium): загрузка LCD, размеры модели 4 × 3 × 3 м, только один GLB при первом открытии, первый ракурс. **На физических устройствах не проверялось** — пройдите вручную:

| Устройство | 3D | AR | Отметка |
|---|---|---|---|
| iPhone Safari (iOS 17+) | | Quick Look | |
| iPhone Safari iOS 16 | | Quick Look | |
| iPad Safari, портрет и альбом | | Quick Look | |
| Android Chrome с ARCore | | WebXR / Scene Viewer | |
| Android без ARCore | | подсказка, 3D работает | |
| Safari / Chrome / Edge / Firefox на компьютере | | QR | |
| Медленная сеть, отказ в камере, 404 модели, нет WebGL | | | |

Сценарий коллеги: открыть `?view=led` → покрутить → «Каркас» → «Поделиться» → открыть ссылку в приватном окне → видно каркас → на телефоне «Посмотреть в пространстве» — открывается именно каркас.

В DevTools → Network при первом открытии должен быть один `.glb` и ни одного `.usdz`.
