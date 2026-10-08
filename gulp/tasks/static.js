const gulp = require('gulp');
const fs = require('fs');
const { BUILD_DIR } = require('../config');
const browserSync = require('../browserSync');

function staticTask(done) {
    if (!fs.existsSync('src/static')) {
        console.log('⏩ static: нет папки src/static/, пропускаем');
        done();
        return;
    }

    return gulp.src('src/static/**/*')
        .pipe(gulp.dest(BUILD_DIR))
        .pipe(browserSync.stream());
}

module.exports = staticTask;