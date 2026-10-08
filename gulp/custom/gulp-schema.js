const { Transform } = require('stream');

function gulpSchema(options = {}) {
    const cfg = options.schema || {};
    const marker = options.marker || '<!-- schema -->';

    return new Transform({
        objectMode: true,
        transform(file, enc, cb) {
            if (file.isNull()) { cb(null, file); return; }
            if (!cfg.enabled) { cb(null, file); return; }

            let content = file.contents.toString();
            if (!content.includes(marker)) { cb(null, file); return; }

            const blocks = [];

            if (cfg.organization) {
                const o = cfg.organization;
                const org = {
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    name: o.name,
                    url: o.url,
                    logo: o.logo,
                    description: o.description
                };
                if (o.sameAs && o.sameAs.length) org.sameAs = o.sameAs;
                blocks.push(org);
            }

            if (cfg.website) {
                const w = cfg.website;
                const ws = {
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: w.name,
                    url: w.url
                };
                if (w.searchUrl) {
                    ws.potentialAction = {
                        '@type': 'SearchAction',
                        target: w.searchUrl,
                        'query-input': 'required name=search_term_string'
                    };
                }
                blocks.push(ws);
            }

            const tags = blocks.map(b =>
                `<script type="application/ld+json">${JSON.stringify(b)}</script>`
            ).join('\n');

            content = content.replace(marker, tags);
            file.contents = Buffer.from(content);
            cb(null, file);
        }
    });
}

module.exports = gulpSchema;
