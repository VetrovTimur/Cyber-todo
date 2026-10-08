const { Transform } = require('stream');

function gulpOg(options = {}) {
    const site = options.site || {};
    const marker = options.marker || '<!-- og-tags -->';

    return new Transform({
        objectMode: true,
        transform(file, enc, cb) {
            if (file.isNull()) { cb(null, file); return; }

            let content = file.contents.toString();
            if (!content.includes(marker)) { cb(null, file); return; }

            const url = site.url || '';
            const name = site.name || '';
            const description = site.description || '';
            const image = site.ogImage ? `${url}/${site.ogImage}` : '';

            const tags = [
                `<meta property="og:type" content="website">`,
                `<meta property="og:title" content="${name}">`,
                `<meta property="og:description" content="${description}">`,
                `<meta property="og:url" content="${url}/">`,
                image ? `<meta property="og:image" content="${image}">` : '',
                image ? `<meta property="og:image:width" content="1200">` : '',
                image ? `<meta property="og:image:height" content="630">` : '',
                `<meta property="og:site_name" content="${name}">`,
                `<meta name="twitter:card" content="summary_large_image">`,
                `<meta name="twitter:title" content="${name}">`,
                `<meta name="twitter:description" content="${description}">`,
                image ? `<meta name="twitter:image" content="${image}">` : ''
            ].filter(Boolean).join('\n');

            content = content.replace(marker, tags);
            file.contents = Buffer.from(content);
            cb(null, file);
        }
    });
}

module.exports = gulpOg;