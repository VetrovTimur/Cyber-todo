const fs = require('fs');
const { BUILD_DIR } = require('../config');
const path = require('path');

const WEIGHT_MAP = {
    thin: 100,
    extralight: 200,
    ultralight: 200,
    light: 300,
    regular: 400,
    normal: 400,
    book: 400,
    medium: 500,
    semibold: 600,
    demibold: 600,
    bold: 700,
    extrabold: 800,
    ultrabold: 800,
    black: 900,
    heavy: 900
};

function parseFontName(filename) {
    const base = path.basename(filename, path.extname(filename));

    const parts = base.split('-');
    if (parts.length < 2) {
        return { family: base, weight: 400, style: 'normal' };
    }

    let family = parts[0].replace(/_\d+pt$/i, '').trim();
    let weightPart = parts[parts.length - 1];
    let style = 'normal';

    if (/italic/i.test(weightPart)) {
        style = 'italic';
        weightPart = weightPart.replace(/italic/i, '');
    } else if (/oblique/i.test(weightPart)) {
        style = 'oblique';
        weightPart = weightPart.replace(/oblique/i, '');
    }

    let weight = 400;
    const weightKey = weightPart.toLowerCase().trim();

    if (weightKey && WEIGHT_MAP[weightKey]) {
        weight = WEIGHT_MAP[weightKey];
    } else if (/^\d+$/.test(weightKey)) {
        weight = parseInt(weightKey, 10);
    }

    return { family, weight, style };
}

function fontFace(done) {
    const fontsDir = path.resolve(`${BUILD_DIR}/fonts`);
    const outputFile = path.resolve('src/scss/_fonts.scss');

    if (!fs.existsSync(fontsDir)) {
        console.log('⚠️  fontFace: папка dist/fonts/ не найдена, пропускаем');
        done();
        return;
    }

    const files = fs.readdirSync(fontsDir);
    const groups = {};

    files.forEach(f => {
        const ext = path.extname(f).slice(1).toLowerCase();
        if (!['woff', 'woff2'].includes(ext)) return;

        const base = path.basename(f, path.extname(f));
        if (!groups[base]) groups[base] = {};
        groups[base][ext] = f;
    });

    const blocks = [];

    Object.entries(groups).forEach(([base, exts]) => {
        const { family, weight, style } = parseFontName(base);
        const srcParts = [];

        if (exts.woff2) {
            srcParts.push(`url('../fonts/${exts.woff2}') format('woff2')`);
        }
        if (exts.woff) {
            srcParts.push(`url('../fonts/${exts.woff}') format('woff')`);
        }

        if (!srcParts.length) return;

        blocks.push(
            `@font-face {
            font-family: '${family}';
            src: ${srcParts.join(',\n       ')};
            font-weight: ${weight};
            font-style: ${style};
            font-display: swap;
            }`
        );
    });

    const output = blocks.join('\n\n') + '\n';

    fs.writeFileSync(outputFile, output, 'utf8');
    console.log(`✅ fontFace: сгенерировано ${blocks.length} @font-face в src/scss/_fonts.scss`);

    done();
}

module.exports = fontFace;
