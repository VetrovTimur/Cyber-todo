const notify = require('gulp-notify').default || require('gulp-notify');

function notifyError(title = 'Ошибка сборки') {
    return notify.onError({
        title: `Gulp: ${title}`,
        message: '<%= error.message %>',
        sound: true
    });
}

module.exports = notifyError;
