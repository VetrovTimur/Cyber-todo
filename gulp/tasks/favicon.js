const fs = require('fs');
const path = require('path');
const { BUILD_DIR } = require('../config');
const browserSync = require('../browserSync');

async function favicon(done) {
    const svgPath = path.join('src', 'favicon.svg');
    const pngPath = path.join('src', 'favicon.png');

    let sourceFile;
    if (fs.existsSync(svgPath)) {
        sourceFile = svgPath;
        console.log('🎨 favicon: использую SVG-исходник');
    } else if (fs.existsSync(pngPath)) {
        sourceFile = pngPath;
        console.log('🎨 favicon: использую PNG-исходник');
    } else {
        console.warn('⚠️  favicon: не найден src/favicon.svg или src/favicon.png — пропускаем');
        done();
        return;
    }

    const faviconSubDir = path.join(BUILD_DIR, 'favicon');
    if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true });
    if (!fs.existsSync(faviconSubDir)) fs.mkdirSync(faviconSubDir, { recursive: true });

    try {
        const { default: favicons } = await import('favicons');

        const result = await favicons(sourceFile, {
            appName: 'Мой крутой сайт',
            appShortName: 'Сайт',
            appDescription: 'Сборка Gulp',
            developerName: 'Timur',
            background: '#ffffff',
            theme_color: '#3498db',
            path: '/favicon',
            url: '',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            version: 1.0,
            logging: false,
            icons: {
                android: true,
                appleIcon: true,
                appleStartup: false,
                favicons: true,
                windows: true,
                yandex: false
            }
        });

        result.images.forEach(img => {
            const outDir = img.name === 'favicon.ico' ? BUILD_DIR : faviconSubDir;
            fs.writeFileSync(path.join(outDir, img.name), img.contents);
        });

        result.files.forEach(file => {
            if (file.name === 'favicon.html') return;

            let outDir = faviconSubDir;
            let content = file.contents;

            if (file.name.endsWith('.xml')) {
                outDir = BUILD_DIR;
                content = content.replace(/mstile-/g, 'favicon/mstile-');
            }

            fs.writeFileSync(path.join(outDir, file.name), content, 'utf8');
        });

        if (result.html && result.html.length) {
            let html = result.html.join('\n');
            html = html
                .split('/favicon/favicon.ico').join('/favicon.ico')
                .split('/favicon/browserconfig.xml').join('/browserconfig.xml');

            fs.writeFileSync(path.join('src', 'favicon.html'), html, 'utf8');
            console.log('✅ favicon: создан src/favicon.html');
        } else {
            console.warn('⚠️  favicon: result.html пустой');
        }

        console.log(`✅ favicon: сгенерировано ${result.images.length + result.files.length} файлов`);

        browserSync.reload();
        done();
    } catch (err) {
        console.error('❌ favicon: ошибка —', err.message);
        done(err);
    }
}

module.exports = favicon;
