const { Transform } = require('stream');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function gulpFontCache(options = {}) {
    const distBase = options.distBase || 'dist/fonts';
    const force = options.force || false;
    const cachePath = path.join(distBase, '.cache.json');

    let cache = {};
    if (fs.existsSync(cachePath)) {
        try {
            cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        } catch (e) {
            console.warn('⚠️  Не удалось прочитать .cache.json для шрифтов — начинаем с нуля');
            cache = {};
        }
    }

    const newCache = {};

    function outputExists(baseName) {
        if (!fs.existsSync(distBase)) return false;
        try {
            const files = fs.readdirSync(distBase);
            const woff = files.some(f => f === `${baseName}.woff`);
            const woff2 = files.some(f => f === `${baseName}.woff2`);
            return woff && woff2;
        } catch (e) {
            return false;
        }
    }

    function computeHash(filePath) {
        const buf = fs.readFileSync(filePath);
        return crypto.createHash('md5').update(buf).digest('hex');
    }

    return new Transform({
        objectMode: true,
        transform(file, enc, cb) {
            if (file.isNull()) {
                cb(null, file);
                return;
            }

            const rel = file.relative.replace(/\\/g, '/');
            const baseName = path.basename(rel, path.extname(rel));

            if (force) {
                console.log(`🔄 Конвертация (force): ${rel}`);
                newCache[rel] = computeHash(file.path);
                cb(null, file);
                return;
            }

            const hash = computeHash(file.path);
            const cachedHash = cache[rel];

            if (cachedHash === hash && outputExists(baseName)) {
                console.log(`⏩ Пропущено (актуально): ${rel}`);
                newCache[rel] = hash;
                cb();
                return;
            }

            if (!cachedHash) {
                console.log(`🆕 Новый шрифт: ${rel}`);
            } else if (cachedHash === hash) {
                console.log(`🔄 Пересборка (нет результатов): ${rel}`);
            } else {
                console.log(`🔄 Изменён: ${rel}`);
            }

            newCache[rel] = hash;
            cb(null, file);
        },
        flush(cb) {
            try {
                if (!fs.existsSync(distBase)) {
                    fs.mkdirSync(distBase, { recursive: true });
                }
                fs.writeFileSync(
                    cachePath,
                    JSON.stringify(newCache, null, 2),
                    'utf8'
                );
            } catch (e) {
                console.warn('⚠️  Не удалось сохранить .cache.json для шрифтов:', e.message);
            }
            cb();
        }
    });
}

module.exports = gulpFontCache;
