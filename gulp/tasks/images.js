const gulp = require('gulp');
const plumber = require('gulp-plumber');
const notifyError = require('../custom/gulp-notify-error');
const sharpResponsive = require('gulp-sharp-responsive');
const rename = require('gulp-rename');
const { paths, imageSizes, imageFormats, retinaMultiplier, BUILD_DIR } = require('../config');
const browserSync = require('../browserSync');
const gulpImageCache = require('../custom/gulp-image-cache');

const FORCE = process.argv.includes('--force');

function safeWidth(targetWidth) {
    return (metadata) => metadata.width >= targetWidth ? targetWidth : null;
}

function buildFormats() {
    const formats = [];

    const baseWidths = new Set(imageSizes.map(s => s.width));

    function isRetinaDuplicate(targetWidth) {
        return baseWidths.has(targetWidth);
    }

    imageSizes.forEach(size => {
        formats.push({
            width: safeWidth(size.width),
            rename: { suffix: size.suffix }
        });

        imageFormats.forEach(fmt => {
            formats.push({
                width: safeWidth(size.width),
                format: fmt,
                rename: { suffix: size.suffix }
            });
        });

        if (retinaMultiplier > 1) {
            const retinaWidth = size.width * retinaMultiplier;

            if (!isRetinaDuplicate(retinaWidth)) {
                formats.push({
                    width: safeWidth(retinaWidth),
                    rename: { suffix: `${size.suffix}@${retinaMultiplier}x` }
                });

                imageFormats.forEach(fmt => {
                    formats.push({
                        width: safeWidth(retinaWidth),
                        format: fmt,
                        rename: { suffix: `${size.suffix}@${retinaMultiplier}x` }
                    });
                });
            }
        }
    });

    return formats;
}

function images() {
    return gulp.src(paths.images.src, { nodir: true, encoding: false })
        .pipe(plumber({
            errorHandler: function (err) {
                if (err.message && err.message.includes('callback must return a number')) {
                    return;
                }
                notifyError('Images').call(this, err);
            }
        }))
        .pipe(gulpImageCache({ distBase: `${BUILD_DIR}/img`, force: FORCE }))
        .pipe(sharpResponsive({ formats: buildFormats() }))
        .pipe(rename((path) => {
            const originalName = path.basename.replace(/-(xs|sm|md|lg|xl)(@\d+x)?$/, '');
            if (originalName && originalName !== path.basename) {
                path.dirname = (path.dirname === '.' || !path.dirname)
                    ? originalName
                    : `${path.dirname}/${originalName}`;
            }
        }))
        .pipe(gulp.dest(paths.images.dest))
        .pipe(browserSync.stream());
}

module.exports = images;
