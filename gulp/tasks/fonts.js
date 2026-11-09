const gulp = require('gulp');
const plumber = require('gulp-plumber');
const notifyError = require('../custom/gulp-notify-error');
const mergeStream = require('merge-stream');
const { paths, BUILD_DIR } = require('../config');
const browserSync = require('../browserSync');
const gulpFontCache = require('../custom/gulp-font-cache');
const gulpTtfToBoth = require('../custom/gulp-ttf-to-both');

const FORCE = process.argv.includes('--force');

function fonts() {
    // Поток 1: TTF/OTF → конвертация в WOFF + WOFF2
    const convertStream = gulp.src(paths.fonts.src, { encoding: false })
        .pipe(plumber({ errorHandler: notifyError('Fonts') }))
        .pipe(gulpFontCache({ distBase: `${BUILD_DIR}/fonts`, force: FORCE }))
        .pipe(gulpTtfToBoth())
        .pipe(gulp.dest(paths.fonts.dest));

    // Поток 2: WOFF2 → копирование как есть (для вариативных шрифтов)
    const copyStream = gulp.src(paths.fonts.srcWoff2, { encoding: false })
        .pipe(plumber({ errorHandler: notifyError('Fonts') }))
        .pipe(gulp.dest(paths.fonts.dest));

    return mergeStream(convertStream, copyStream)
        .pipe(browserSync.stream());
}

module.exports = fonts;
