# Gulp Starter

Мощная сборка Gulp с SCSS, esbuild, WebP/AVIF, critical CSS и SEO-оптимизациями.

## Требования

- Node.js 18+
- npm 9+

## Установка

```bash
npm install
```

## Команды

| Команда | Что делает |
|---------|-----------|
| `npm run dev` | Dev-режим: сборка в `dist/`, watch, BrowserSync на `localhost:3000` |
| `npm run build` | Prod-сборка в `build/` — минификация, хэши, critical CSS |
| `npm run clean` | Очистка `dist/` или `build/` (сохраняет `img/`, `fonts/`, `svg/`) |
| `npm run clean:all` | Полная очистка выходной папки |
| `npm run lint` | ESLint + Stylelint |
| `npm run lint:fix` | Автоисправление ошибок линтеров |
| `npm run analyze` | Bundle Analyzer — отчёт о размерах JS |

## Структура

```
src/
├── js/          JavaScript (esbuild)
├── scss/        SCSS-стили
├── img/         Изображения (WebP, AVIF, retina)
├── fonts/       Шрифты (TTF/OTF → WOFF/WOFF2)
├── svg/         SVG (спрайты mono/multi, контентные)
├── static/      Файлы без обработки (OG-картинки, PDF и т.д.)
├── parts/       HTML-компоненты (header, footer, ...)
└── index.html   Главная страница

gulp/
├── tasks/       Задачи Gulp
├── custom/      Самописные плагины
└── index.js     Точка входа

dist/            Dev-сборка
build/           Prod-сборка
```

## Разработка

### Pre-commit hooks

Перед каждым `git commit` автоматически запускаются линтеры на изменённых файлах (через `husky` + `lint-staged`). Если есть ошибки — коммит не проходит.

Чтобы обойти проверку (не рекомендуется):
```bash
git commit --no-verify -m "message"

## Возможности

- **HTML:** инклюды, минификация, автоматическая генерация `<picture>` и inline SVG
- **SCSS:** компиляция, автопрефиксы, sourcemaps (dev), минификация (prod)
- **JS:** esbuild с модулями и минификацией
- **Изображения:** WebP + AVIF + retina, дедупликация, кэш по MD5
- **Шрифты:** TTF → WOFF/WOFF2, автогенерация `@font-face`, preload
- **SVG:** спрайты `mono` и `multi`, оптимизация через SVGO
- **Favicon:** 33 файла для всех платформ
- **Critical CSS:** два режима — manual (маркеры) и auto (Puppeteer)
- **SEO:** OG-теги, Schema.org, sitemap.xml, robots.txt
- **Линтеры:** ESLint, Stylelint, html-validate
- **Pre-commit hooks:** автоматическая проверка кода перед коммитом
- **Prod:** хэширование имён файлов, минификация, без sourcemaps

## Конфигурация

Все настройки — в `gulp/config.js`:

- `paths` — пути к файлам
- `imageSizes`, `imageFormats`, `retinaMultiplier` — настройки изображений
- `preloadFonts` — preload шрифтов
- `criticalCss` — режим critical CSS (`manual` / `auto`)
- `site` — SEO-данные (URL, название, OG-картинка, приоритеты страниц)
- `schema` — Schema.org разметка

## Лицензия

MIT
