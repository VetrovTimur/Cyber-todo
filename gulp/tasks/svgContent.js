const gulp = require('gulp');
const fs = require('fs');
const svgo = require('gulp-svgo');
const browserSync = require('../browserSync');
const { BUILD_DIR } = require('../config');

function hasSvgs(dir) {
    if (!fs.existsSync(dir)) return false;
    return fs.readdirSync(dir).some(f => f.toLowerCase().endsWith('.svg'));
}

function svgContent(done) {
    if (!hasSvgs('src/svg/content')) {
        console.log('⚠️  svgContent: нет SVG в src/svg/content/, пропускаем');
        done();
        return;
    }

    return gulp.src('src/svg/content/**/*.svg')
        .pipe(svgo({
            plugins: [
                { name: 'preset-default' },
                { name: 'removeAttrs', params: { attrs: 'class' } },
            ]
        }))
        .pipe(gulp.dest(`${BUILD_DIR}/svg/content`))
        .pipe(browserSync.stream());
}

module.exports = svgContent;
