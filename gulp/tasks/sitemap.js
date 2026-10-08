const gulp = require('gulp');
const sitemap = require('gulp-sitemap');
const fs = require('fs');
const path = require('path');
const { BUILD_DIR, site } = require('../config');

function sitemapTask(done) {
    gulp.src(`${BUILD_DIR}/**/*.html`, { read: false })
        .pipe(sitemap({
            siteUrl: site.url,
            changefreq: 'weekly',
            priority: function (url) {
                const segment = url.replace(site.url, '').replace(/^\//, '') || 'index.html';
                return site.priorities[segment] || site.priorities.default;
            }
        }))
        .pipe(gulp.dest(BUILD_DIR))
        .on('end', () => {
            const robots = `User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`;
            fs.writeFileSync(path.join(BUILD_DIR, 'robots.txt'), robots, 'utf8');

            console.log(`✅ sitemap: создан sitemap.xml + robots.txt для ${site.url}`);
            done();
        });
}

module.exports = sitemapTask;
