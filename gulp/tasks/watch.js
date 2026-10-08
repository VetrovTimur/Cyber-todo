const gulp = require('gulp');
const { paths } = require('../config');
const html = require('./html');
const styles = require('./styles');
const scripts = require('./scripts');
const images = require('./images');
const fonts = require('./fonts');
const { spriteMono, spriteMulti } = require('./sprites');
const svgContent = require('./svgContent');
const favicon = require('./favicon');

function watchFiles() {
    gulp.watch('src/**/*.html', html);
    gulp.watch('src/scss/**/*.scss', styles);
    gulp.watch('src/js/**/*.js', scripts);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.fonts.src, fonts);
    gulp.watch('src/svg/icons/mono/**/*.svg', spriteMono);   
    gulp.watch('src/svg/icons/multi/**/*.svg', spriteMulti);
    gulp.watch('src/svg/content/**/*.svg', svgContent);
    gulp.watch('src/favicon.{svg,png}', favicon);
}

module.exports = watchFiles;
