const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');

function gulpPreloadFonts(options = {}) {
    const fontsScss = options.fontsScss || 'src/scss/_fonts.scss';
    const marker = options.marker || '<!-- preload-fonts -->';
    const hrefPrefix = options.hrefPrefix || 'fonts/';

    const cfg = options.config || {};
    const enabled = cfg.enabled !== false;
    const mainFamily = cfg.mainFamily || '';
    const weights = cfg.weights || [400, 700];

    return new Transform({
        objectMode: true,
        transform(file, enc, cb) {
            if (file.isNull()) { cb(null, file); return; }

            let content = file.contents.toString();
            if (!content.includes(marker)) { cb(null, file); return; }

            if (!enabled) {
                content = content.replace(marker, '');
                file.contents = Buffer.from(content);
                cb(null, file);
                return;
            }

            if (!fs.existsSync(fontsScss)) {
                console.warn('⚠️  preloadFonts: не найден ' + fontsScss);
                content = content.replace(marker, '');
                file.contents = Buffer.from(content);
                cb(null, file);
                return;
            }

            const scss = fs.readFileSync(fontsScss, 'utf8');
            const blocks = scss.match(/@font-face\s*\{[^}]*\}/g) || [];

            const preloads = [];
            blocks.forEach(block => {
                const familyMatch = block.match(/font-family:\s*['"]?([^'";]+)/);
                const weightMatch = block.match(/font-weight:\s*(\d+)/);
                const styleMatch = block.match(/font-style:\s*(\w+)/);
                const woff2Match = block.match(/url\(['"]?([^'"]+\.woff2)['"]?\)/);

                if (!familyMatch || !weightMatch || !styleMatch || !woff2Match) return;

                const family = familyMatch[1].trim();
                const weight = weightMatch[1];
                const style = styleMatch[1];
                const filename = path.basename(woff2Match[1]);

                if (mainFamily && family !== mainFamily) return;
                if (!weights.includes(parseInt(weight, 10))) return;
                if (style !== 'normal') return;

                preloads.push(
                    `<link rel="preload" href="${hrefPrefix}${filename}" as="font" type="font/woff2" crossorigin>`
                );
            });

            content = content.replace(marker, preloads.join('\n'));
            file.contents = Buffer.from(content);
            cb(null, file);
        }
    });
}

module.exports = gulpPreloadFonts;