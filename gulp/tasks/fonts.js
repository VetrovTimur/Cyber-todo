const gulp = require('gulp');
const plumber = require('gulp-plumber');
const notifyError = require('../custom/gulp-notify-error');
const { paths, BUILD_DIR } = require('../config');
const browserSync = require('../browserSync');
const gulpFontCache = require('../custom/gulp-font-cache');
const gulpTtfToBoth = require('../custom/gulp-ttf-to-both');

const FORCE = process.argv.includes('--force');

function fonts() {
    return gulp.src(paths.fonts.src, { encoding: false })
        .pipe(plumber({ errorHandler: notifyError('Fonts') }))
        .pipe(gulpFontCache({ distBase: `${BUILD_DIR}/fonts`, force: FORCE }))
        .pipe(gulpTtfToBoth())
        .pipe(gulp.dest(paths.fonts.dest))
        .pipe(browserSync.stream());
}

module.exports = fonts;
