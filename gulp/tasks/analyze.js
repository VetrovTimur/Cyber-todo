const esbuild = require('esbuild');
const { visualizer } = require('esbuild-visualizer');
const fs = require('fs');
const path = require('path');
const { BUILD_DIR } = require('../config');

async function analyze(done) {
    try {
        console.log('🔍 analyze: собираем JS с метаданными...');

        const result = await esbuild.build({
            entryPoints: ['src/js/main.js'],
            bundle: true,
            minify: true,
            sourcemap: false,
            metafile: true,
            outfile: path.join('dist/js', 'main.analyze.js'),
            write: false
        });

        // Генерируем HTML-отчёт
        const html = await visualizer(result.metafile, {
            filename: 'analyze.html',
            title: 'Bundle Analyzer',
            template: 'treemap'      
        });

        const outPath = path.join('dist', 'analyze.html');
        fs.writeFileSync(outPath, html, 'utf8');

        console.log(`✅ analyze: отчёт создан → ${outPath}`);
        console.log(`   Открой в браузере: http://localhost:3000/analyze.html`);

        done();
    } catch (err) {
        console.error('❌ analyze:', err.message);
        done(err);
    }
}

module.exports = analyze;
