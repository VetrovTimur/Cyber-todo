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

function gulpIcon(options = {}) {
    const spritePath = options.spritePath || 'svg/icons';

    return new Transform({
        objectMode: true,
        transform(file, enc, cb) {
            if (file.isNull()) { cb(null, file); return; }

            let content = file.contents.toString();
            const markerRegex = /\{\{icon\(\s*([^,)]+?)\s*(?:,\s*([^)]*?))?\s*\)\}\}/g;

            content = content.replace(markerRegex, (match, name, argsRaw) => {
                name = name.trim();
                const args = argsRaw ? parseArgs(argsRaw) : [];

                const className = args[0] || '';
                const type = args[1];

                if (type !== 'mono' && type !== 'multi') {
                    console.warn(`⚠️  icon: не указан или неверный тип для иконки "${name}" (должно быть "mono" или "multi")`);
                    return match;
                }

                const spriteFile = type === 'mono' ? 'icons-mono.svg' : 'icons-multi.svg';
                const href = `${spritePath}/${spriteFile}#${type}-${name}`;
                const classAttr = className ? ` class="${className}"` : '';

                return `<svg${classAttr} aria-hidden="true"><use href="${href}"></use></svg>`;
            });

            file.contents = Buffer.from(content);
            cb(null, file);
        }
    });
}

module.exports = gulpIcon;