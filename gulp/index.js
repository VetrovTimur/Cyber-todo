const gulp = require('gulp');

const { clean, cleanAll } = require('./tasks/clean');
const html    = require('./tasks/html');
const styles  = require('./tasks/styles');
const scripts = require('./tasks/scripts');
const images  = require('./tasks/images');
const fonts   = require('./tasks/fonts');
const { spriteMono, spriteMulti } = require('./tasks/sprites');
const svgContent = require('./tasks/svgContent');
const fontFace = require('./tasks/fontFace');
const watch   = require('./tasks/watch');
const serve   = require('./tasks/serve');
const favicon = require('./tasks/favicon');
const criticalCss = require('./tasks/criticalCss');
const htmlValidate = require('./tasks/htmlValidate');
const sizeTask = require('./tasks/size');
const sitemapTask = require('./tasks/sitemap');
const staticTask = require('./tasks/static');
const analyze = require('./tasks/analyze');

const buildDev = gulp.series(
    clean,
    gulp.parallel(images, fonts, spriteMono, spriteMulti, svgContent, favicon, staticTask),
    fontFace,
    gulp.parallel(html, styles, scripts),
    analyze
);

const buildProd = gulp.series(
    clean,
    gulp.parallel(images, fonts, spriteMono, spriteMulti, svgContent, favicon, staticTask),
    fontFace,
    gulp.parallel(styles, scripts),
    html,
    htmlValidate,
    criticalCss,
    sitemapTask,
    sizeTask
);

const dev = gulp.series(buildDev, gulp.parallel(watch, serve));

module.exports = {
    clean,
    'clean:all': cleanAll,
    html,
    styles,
    scripts,
    images,
    fonts,
    spriteMono,
    spriteMulti,
    svgContent,
    fontFace,
    watch,
    serve,
    build: buildProd,        
    default: dev,
    size: sizeTask,
    sitemap: sitemapTask,
    analyze,
};
