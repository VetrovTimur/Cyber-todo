const gulp = require('gulp');
const size = require('gulp-size').default || require('gulp-size');
const { BUILD_DIR } = require('../config');

function sizeTask() {
    return gulp.src(`${BUILD_DIR}/**/*.{html,css,js,svg}`)
        .pipe(size({
            title: `📦 Размер ${BUILD_DIR}/:`,
            showFiles: true,
            showTotal: true,
            gzip: true
        }));
}

module.exports = sizeTask;