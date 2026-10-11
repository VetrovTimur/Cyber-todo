const fs = require('fs');
const path = require('path');
const { BUILD_DIR, criticalCss: cfg } = require('../config');

// Извлекает содержимое блока CRITICAL:<name>:START ... CRITICAL:<name>:END
function extractBlock(css, name) {
    const regex = new RegExp(
        '\\/\\*!\\s*CRITICAL:' + name + ':START\\s*\\*\\/([\\s\\S]*?)\\/\\*!\\s*CRITICAL:' + name + ':END\\s*\\*\\/',
        'g'
    );
    const parts = [];
    let m;
    while ((m = regex.exec(css)) !== null) parts.push(m[1].trim());
    return parts.join('\n\n');
}

// Удаляет ВСЕ критические блоки из CSS
function removeAllCritical(css) {
    return css.replace(
        /\/\*!\s*CRITICAL:[a-z0-9_-]+:START\s*\*\/([\s\S]*?)\/\*!\s*CRITICAL:[a-z0-9_-]+:END\s*\*\//gi,
        ''
    );
}

function hasAnyCritical(css) {
    return /\/\*!\s*CRITICAL:[a-z0-9_-]+:START\s*\*\//i.test(css);
}

function getHtmlFiles() {
    return fs.readdirSync(BUILD_DIR).filter(f => f.endsWith('.html'));
}

function injectIntoHtml(htmlPath, criticalCss) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    const styleTag = '<style>' + criticalCss + '</style>';

    if (html.includes('<!-- critical-css -->')) {
        html = html.replace('<!-- critical-css -->', styleTag);
    } else {
        html = html.replace(/<head([^>]*)>/i, '<head$1>' + styleTag);
    }

    fs.writeFileSync(htmlPath, html, 'utf8');
}

// === РУЧНОЙ РЕЖИМ ===
function runManual() {
    const cssDir = path.join(BUILD_DIR, 'css');
    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
    const cssFile = path.join(cssDir, cssFiles[0]);
    const cssContent = fs.readFileSync(cssFile, 'utf8');

    if (!hasAnyCritical(cssContent)) {
        console.log('⏩ criticalCss (manual): критических блоков нет');
        return;
    }

    // Общий блок — идёт на все страницы
    const common = extractBlock(cssContent, 'common');

    // Удаляем все критические блоки из основного CSS
    fs.writeFileSync(cssFile, removeAllCritical(cssContent), 'utf8');

    // Проходимся по всем .html
    const htmlFiles = getHtmlFiles();
    let processed = 0;

    htmlFiles.forEach(file => {
        // index.html → 'index', contacts.html → 'contacts'
        const pageName = path.basename(file, '.html');
        const page = extractBlock(cssContent, pageName);

        const critical = [common, page].filter(Boolean).join('\n\n');
        if (!critical) {
            console.log('⚠️  Нет critical для ' + file);
            return;
        }

        injectIntoHtml(path.join(BUILD_DIR, file), critical);
        processed++;
    });

    console.log('✅ criticalCss (manual): обработано ' + processed + ' файлов');
}

// === АВТО-РЕЖИМ ===
async function runAuto() {
    const criticalModule = await import('critical');
    const generate =
        criticalModule.generate ||
        (criticalModule.default && criticalModule.default.generate) ||
        criticalModule.default;

    if (typeof generate !== 'function') {
        throw new Error('critical.generate не найден');
    }

    const cssDir = path.join(BUILD_DIR, 'css');
    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
    const cssName = cssFiles[0];
    const htmlFiles = getHtmlFiles();

    for (const file of htmlFiles) {
        const htmlPath = path.join(BUILD_DIR, file);
        const html = fs.readFileSync(htmlPath, 'utf8');

        const result = await generate({
            html,
            base: BUILD_DIR,
            css: ['css/' + cssName],
            inline: true,
            minify: true,
            width: 1300,
            height: 900,
            ignore: { atrule: ['@font-face'] }
        });

        let newHtml = result.html;

        newHtml = newHtml.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/, (match, open, css, close) => {
            const cleaned = css.replace(/@font-face\s*\{[^}]*\}/g, '');
            return open + cleaned + close;
        });

        newHtml = newHtml.replace(
            /<link\s+href="(css\/[^"]+)"\s+as="style"\s+rel="preload">/g,
            '<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n<noscript><link rel="stylesheet" href="$1"></noscript>'
        );

        newHtml = newHtml.replace(/<link\s+rel="stylesheet"\s+href="css\/[^"]+"><\/body>/g, '</body>');
        newHtml = newHtml.replace('<!-- critical-css -->', '');

        fs.writeFileSync(htmlPath, newHtml, 'utf8');
    }

    const cssPath = path.join(cssDir, cssName);
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    cssContent = removeAllCritical(cssContent);
    fs.writeFileSync(cssPath, cssContent, 'utf8');

    console.log('✅ criticalCss (auto): обработано ' + htmlFiles.length + ' файлов');
}

// === ОСНОВНАЯ ЗАДАЧА ===
async function criticalCss(done) {
    if (!cfg.enabled) {
        console.log('⏩ criticalCss: отключено');
        done();
        return;
    }

    try {
        if (cfg.mode === 'auto') await runAuto();
        else runManual();
        done();
    } catch (err) {
        console.error('❌ criticalCss:', err.message);
        done(err);
    }
}

module.exports = criticalCss;
