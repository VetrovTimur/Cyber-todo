const browserSync = require('../browserSync');

function serve() {
    browserSync.init({
        server: { baseDir: './dist' },
        notify: false
    });
}

module.exports = serve;
