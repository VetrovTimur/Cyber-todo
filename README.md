# Gulp Starter

Мощная Gulp-сборка с SCSS, esbuild, WebP/AVIF, per-page critical CSS и SEO-оптимизациями.

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
├── js/                  JavaScript (esbuild)
├── scss/                SCSS-стили
│   ├── style.scss       Точка входа
│   ├── _variables.scss  Общие переменные
│   ├── _fonts.scss      Генерируется автоматически
│   ├── critical/        Критичные стили (per-page)
│   │   ├── common.scss
│   │   ├── index.scss
│   │   ├── contacts.scss
│   │   └── about.scss
│   ├── parts/           Общие компоненты (не критичны)
│   └── pages/           Специфика страниц (не критична)
├── img/                 Изображения (WebP, AVIF, retina)
├── fonts/               Шрифты (TTF → WOFF/WOFF2)
├── svg/                 SVG (спрайты mono/multi, контентные)
├── static/              Файлы без обработки (OG-картинки, PDF и т.д.)
├── parts/               HTML-компоненты (header, footer, ...)
├── index.html           Главная
├── contacts.html        Контакты
└── about.html           О проекте

gulp/
├── tasks/               Задачи Gulp
├── custom/              Самописные плагины
└── index.js             Точка входа

dist/                    Dev-сборка
build/                   Prod-сборка
```

## Разработка

### Pre-commit hooks

Перед каждым `git commit` автоматически запускаются линтеры на изменённых файлах (через `husky` + `lint-staged`). Если есть ошибки — коммит не проходит.

Чтобы обойти проверку (не рекомендуется):

```bash
git commit --no-verify -m "message"
```

## Возможности

### HTML
- Инклюды (`@@include('parts/header.html')`)
- Минификация
- Автогенерация `<picture>` с AVIF/WebP/retina
- Inline SVG-иконки из спрайтов
- Preload шрифтов
- OG-теги для соцсетей
- Schema.org (JSON-LD)
- Per-page critical CSS

### SCSS
- Компиляция, автопрефиксы
- Sourcemaps (dev)
- Минификация (prod)
- Разбивка на `critical/`, `parts/`, `pages/`

### JS
- esbuild с модулями и bundle
- Минификация
- Sourcemaps (dev)

### Изображения
- WebP + AVIF
- Retina-генерация (`@2x`)
- Дедупликация одинаковых размеров
- Инкрементальный кэш по MD5

### Шрифты
- TTF → WOFF + WOFF2
- Автогенерация `@font-face`
- Preload критичных шрифтов
- Инкрементальный кэш по MD5

### SVG
- Спрайты `mono` (перекрашиваются через CSS) и `multi` (цветные)
- Оптимизация через SVGO
- Демо-страницы спрайтов в dev-режиме

### Favicon
- 33 файла для всех платформ (iOS, Android, Windows, Yandex)
- `favicon.ico` и `browserconfig.xml` в корне
- Остальное в `/favicon/`

### Critical CSS
- Два режима: `manual` (маркеры в SCSS) и `auto` (Puppeteer)
- Per-page: общий блок `common` + блок конкретной страницы

### SEO
- Open Graph (Facebook, Telegram, VK)
- Twitter Card
- Schema.org (Organization + WebSite)
- sitemap.xml с приоритетами страниц
- robots.txt

### Линтеры
- ESLint для JS
- Stylelint для SCSS
- html-validate для HTML
- Pre-commit hooks (husky + lint-staged)

### Prod-сборка
- Хэширование имён файлов (cache busting)
- Минификация CSS/JS/HTML
- Без sourcemaps
- Валидация HTML
- Отчёт о размерах (gulp-size)

## Конфигурация

Все настройки — в `gulp/config.js`:

| Параметр | Описание |
|----------|----------|
| `paths` | Пути к файлам (src/dest для всех задач) |
| `imageSizes` | Размеры для генерации картинок |
| `imageFormats` | Форматы конвертации (webp, avif) |
| `retinaMultiplier` | Множитель ретины (2 = @2x) |
| `preloadFonts` | Настройки preload шрифтов |
| `criticalCss` | Режим critical CSS (`manual` / `auto`) |
| `site` | SEO-данные: url, name, description, ogImage, priorities |
| `schema` | Schema.org разметка (Organization, WebSite) |
| `faviconsConfig` | Настройки favicon (appName, theme_color и т.д.) |

## Как добавить новую страницу

1. Создай `src/<page>.html` с маркерами `<!-- critical-css -->`, `<!-- og-tags -->`, `<!-- schema -->`, `<!-- preload-fonts -->`.
2. Если нужны критические стили — создай `src/scss/critical/<page>.scss` с маркерами `/*! CRITICAL:<page>:START */`.
3. Если есть некритичные стили — создай `src/scss/pages/<page>Pages.scss`.
4. Импортируй оба файла в `src/scss/style.scss`.
5. Добавь приоритет в `config.js` → `site.priorities` (опционально).

## Лицензия

MIT
