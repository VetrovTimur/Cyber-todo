const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { BUILD_DIR, isProd } = require('../config');

function htmlValidate(done) {
    if (!isProd) {
        console.log('⏩ htmlValidate: только для prod');
        done();
        return;
    }

    const htmlFiles = fs.readdirSync(BUILD_DIR)
        .filter(f => f.endsWith('.html'));

    if (!htmlFiles.length) {
        console.log('⏩ htmlValidate: HTML-файлов не найдено');
        done();
        return;
    }

    console.log('🔍 htmlValidate: проверяем HTML...');

    try {
        const targets = htmlFiles.map(f => path.join(BUILD_DIR, f)).join(' ');
        execSync(`npx html-validate ${targets}`, { stdio: 'inherit' });
        console.log('✅ htmlValidate: ошибок нет');
        done();
    } catch (err) {
        done(new Error('htmlValidate нашёл ошибки — сборка прервана'));
    }
}

module.exports = htmlValidate;
