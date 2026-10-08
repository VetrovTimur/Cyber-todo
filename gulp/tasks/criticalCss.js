const fs = require('fs');
const path = require('path');
const { BUILD_DIR, criticalCss: cfg } = require('../config');

function extractCritical(css) {
    const regex = /\/\*!\s*CRITICAL:START\s*\*\/([\s\S]*?)\/\*!\s*CRITICAL:END\s*\*\//g;
    const parts = [];
    let m;
    while ((m = regex.exec(css)) !== null) parts.push(m[1].trim());
    return parts.join('\n\n');
}

function removeCritical(css) {
    const regex = /\/\*!\s*CRITICAL:START\s*\*\/([\s\S]*?)\/\*!\s*CRITICAL:END\s*\*\//g;
    return css.replace(regex, '');
}

function runManual() {
    const cssDir = path.join(BUILD_DIR, 'css');
    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
    const cssFile = path.join(cssDir, cssFiles[0]);
    const cssContent = fs.readFileSync(cssFile, 'utf8');

    if (!cssContent.includes('CRITICAL:START')) {
        console.log('⏩ criticalCss (manual): маркеры не найдены в CSS');
        return;
    }

    const critical = extractCritical(cssContent);
    fs.writeFileSync(cssFile, removeCritical(cssContent), 'utf8');

    const htmlFile = path.join(BUILD_DIR, 'index.html');
    let html = fs.readFileSync(htmlFile, 'utf8');
    const styleTag = `<style>${critical}</style>`;

    if (html.includes('<!-- critical-css -->')) {
        html = html.replace('<!-- critical-css -->', styleTag);
    } else {
        html = html.replace(/<head([^>]*)>/i, `<head$1>${styleTag}`);
    }

    fs.writeFileSync(htmlFile, html, 'utf8');
    console.log(`✅ criticalCss (manual): вставлено ${critical.length} символов`);
}

async function runAuto() {
    const criticalModule = await import('critical');
    const generate =
        criticalModule.generate ||
        (criticalModule.default && criticalModule.default.generate) ||
        criticalModule.default;

    if (typeof generate !== 'function') {
        throw new Error('critical.generate не найден в модуле');
    }

    const cssDir = path.join(BUILD_DIR, 'css');
    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
    const cssName = cssFiles[0];

    const htmlPath = path.join(BUILD_DIR, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    const result = await generate({
        html,
        base: BUILD_DIR,
        css: [`css/${cssName}`],
        inline: true,
        minify: true,
        width: 1300,
        height: 900,
        ignore: {
            atrule: ['@font-face']
        }
    });

    let newHtml = result.html;

    newHtml = newHtml.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/, (match, open, css, close) => {
        const cleaned = css.replace(/@font-face\s*\{[^}]*\}/g, '');
        return `${open}${cleaned}${close}`;
    });

    newHtml = newHtml.replace(
        /<link\s+href="(css\/[^"]+)"\s+as="style"\s+rel="preload">/g,
        '<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n<noscript><link rel="stylesheet" href="$1"></noscript>'
    );

    newHtml = newHtml.replace(/<link\s+rel="stylesheet"\s+href="css\/[^"]+"><\/body>/g, '</body>');

    newHtml = newHtml.replace('<!-- critical-css -->', '');

    fs.writeFileSync(htmlPath, newHtml, 'utf8');

    const cssPath = path.join(cssDir, cssName);
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    cssContent = cssContent.replace(
        /\/\*!\s*CRITICAL:START\s*\*\/([\s\S]*?)\/\*!\s*CRITICAL:END\s*\*\//g,
        ''
    );
    fs.writeFileSync(cssPath, cssContent, 'utf8');

    console.log(`✅ criticalCss (auto): inline ${result.css ? result.css.length : '?'} символов + постобработка`);
}

async function criticalCss(done) {
    if (!cfg.enabled) {
        console.log('⏩ criticalCss: отключено');
        done();
        return;
    }

    try {
        if (cfg.mode === 'auto') {
            await runAuto();
        } else {
            runManual();
        }
        done();
    } catch (err) {
        console.error('❌ criticalCss:', err.message);
        done(err);
    }
}

module.exports = criticalCss;
