const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');

function parseArgs(str) {
    const args = [];
    const regex = /"([^"]*)"|'([^']*)'|([^,]+)/g;
    let m;
    while ((m = regex.exec(str)) !== null) {
        const raw = (m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]);
        const val = raw.trim().replace(/^["']|["']$/g, '');
        args.push(val);
    }
    return args;
}

function gulpPicture(options = {}) {
    const imageSizes = options.imageSizes || [];
    const imagesBasePath = options.imagesBasePath || 'img';
    const distImagesDir = options.distImagesDir || 'dist/img';

    const suffixToWidth = {};
    imageSizes.forEach(s => { suffixToWidth[s.suffix] = s.width; });

    return new Transform({
        objectMode: true,
        transform(file, enc, cb) {
            if (file.isNull()) { cb(null, file); return; }

            let content = file.contents.toString();
            const markerRegex = /\{\{picture\(\s*([^,)]+?)\s*(?:,\s*([^)]*?))?\s*\)\}\}/g;

            content = content.replace(markerRegex, (match, name, argsRaw) => {
                name = name.trim();
                const args = argsRaw ? parseArgs(argsRaw) : [];
                const className = args[0] || '';
                const alt = args[1] || '';

                const imageDir = path.join(distImagesDir, name);
                if (!fs.existsSync(imageDir)) {
                    console.warn(`⚠️  picture: папка не найдена — ${imageDir}`);
                    return match;
                }

                const files = fs.readdirSync(imageDir);
                const byFormat = { avif: [], webp: [], jpg: [], png: [] };

                files.forEach(f => {
                    const ext = path.extname(f).slice(1).toLowerCase();
                    const base = path.basename(f, path.extname(f));
                    const m = base.match(/-([a-z]+)(@(\d+)x)?$/i);
                    if (!m) return;

                    const suffix = `-${m[1]}`;
                    const retina = m[3] ? parseInt(m[3], 10) : 1;
                    const baseWidth = suffixToWidth[suffix];
                    if (!baseWidth) return;

                    const width = baseWidth * retina;
                    const fmt = ext === 'jpeg' ? 'jpg' : ext;
                    if (byFormat[fmt]) byFormat[fmt].push({ file: f, width });
                });

                Object.keys(byFormat).forEach(fmt => {
                    byFormat[fmt].sort((a, b) => a.width - b.width);
                });

                const relBase = `${imagesBasePath}/${name}`;
                const parts = ['<picture>'];

                if (byFormat.avif.length) {
                    const srcset = byFormat.avif.map(i => `${relBase}/${i.file} ${i.width}w`).join(', ');
                    parts.push(`  <source type="image/avif" srcset="${srcset}">`);
                }
                if (byFormat.webp.length) {
                    const srcset = byFormat.webp.map(i => `${relBase}/${i.file} ${i.width}w`).join(', ');
                    parts.push(`  <source type="image/webp" srcset="${srcset}">`);
                }

                const fallbackList = byFormat.jpg.length ? byFormat.jpg : byFormat.png;
                if (fallbackList.length) {
                    const srcset = fallbackList.map(i => `${relBase}/${i.file} ${i.width}w`).join(', ');
                    const middle = fallbackList[Math.floor(fallbackList.length / 2)];
                    const classAttr = className ? ` class="${className}"` : '';
                    parts.push(`  <img src="${relBase}/${middle.file}" srcset="${srcset}" alt="${alt}"${classAttr} loading="lazy">`);
                }

                parts.push('</picture>');
                return parts.join('\n');
            });

            file.contents = Buffer.from(content);
            cb(null, file);
        }
    });
}

module.exports = gulpPicture;