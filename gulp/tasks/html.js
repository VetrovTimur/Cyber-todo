const gulp = require('gulp');
const plumber = require('gulp-plumber');
const notifyError = require('../custom/gulp-notify-error');
const fileinclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const revRewrite = require('gulp-rev-rewrite').default || require('gulp-rev-rewrite');
const fs = require('fs');
const path = require('path');
const { paths, imageSizes, BUILD_DIR, isProd, site, preloadFonts, schema } = require('../config');
const gulpSchema = require('../custom/gulp-schema');
const gulpOg = require('../custom/gulp-og');
const browserSync = require('../browserSync');
const gulpPicture = require('../custom/gulp-picture');
const gulpIcon = require('../custom/gulp-icon');
const gulpPreloadFonts = require('../custom/gulp-preload-fonts');


function html() {
    let stream = gulp.src(paths.html.src)
        .pipe(plumber({ errorHandler: notifyError('HTML') }))
        .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
        .pipe(gulpPicture({
            imageSizes,
            imagesBasePath: 'img',
            distImagesDir: `${BUILD_DIR}/img`
        }))
        .pipe(gulpIcon({ spritePath: 'svg/icons' }))
        .pipe(gulpPreloadFonts({
            fontsScss: 'src/scss/_fonts.scss',
            config: preloadFonts
        }))
        .pipe(gulpOg({ site }))
        .pipe(gulpSchema({ schema }))
        .pipe(htmlmin({ collapseWhitespace: true }));

    if (isProd) {
        const manifestPath = path.join(BUILD_DIR, 'rev-manifest.json');
        if (fs.existsSync(manifestPath)) {
            const manifest = fs.readFileSync(manifestPath, 'utf8');
            stream = stream.pipe(revRewrite({ manifest }));
        } else {
            console.warn('⚠️  html: rev-manifest.json не найден — ссылки не будут подменены');
        }
    }

    return stream
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream());
}

module.exports = html;
