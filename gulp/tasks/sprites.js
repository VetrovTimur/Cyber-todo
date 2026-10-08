const gulp = require('gulp');
const fs = require('fs');
const svgSprite = require('gulp-svg-sprite');
const browserSync = require('../browserSync');
const { BUILD_DIR } = require('../config');

function hasSvgs(dir) {
    if (!fs.existsSync(dir)) return false;
    return fs.readdirSync(dir).some(f => f.toLowerCase().endsWith('.svg'));
}

function spriteMono(done) {
    // Если иконок нет — пропускаем задачу
    if (!hasSvgs('src/svg/icons/mono')) {
        console.log('⚠️  spriteMono: нет иконок в src/svg/icons/mono/, пропускаем');
        done();
        return;
    }

    return gulp.src('src/svg/icons/mono/**/*.svg')
        .pipe(svgSprite({
            mode: {
                symbol: {
                    dest: '.',
                    sprite: 'icons-mono.svg',
                    example: false
                }
            },
            shape: {
                transform: [{
                    svgo: {
                        plugins: [
                            { name: 'preset-default' },
                            { name: 'removeAttrs', params: { attrs: '(fill|stroke|class)' } },
                            { name: 'addAttributesToSVGElement', params: { attributes: [{ fill: 'currentColor' }] } },
                            { name: 'prefixIds', params: { prefix: 'mono-' } },
                            { name: 'removeXMLNS' },
                        ]
                    }
                }]
            }
        }))
        .pipe(gulp.dest(`${BUILD_DIR}/svg/icons`))
        .pipe(browserSync.stream());
}

function spriteMulti(done) {
    if (!hasSvgs('src/svg/icons/multi')) {
        console.log('⚠️  spriteMulti: нет иконок в src/svg/icons/multi/, пропускаем');
        done();
        return;
    }

    return gulp.src('src/svg/icons/multi/**/*.svg')
        .pipe(svgSprite({
            mode: {
                symbol: {
                    dest: '.',
                    sprite: 'icons-multi.svg',
                    example: false
                }
            },
            shape: {
                transform: [{
                    svgo: {
                        plugins: [
                            { name: 'preset-default' },
                            { name: 'removeAttrs', params: { attrs: 'class' } },
                            { name: 'prefixIds', params: { prefix: 'multi-' } },
                            { name: 'removeXMLNS' }
                        ]
                    }
                }]
            }
        }))
        .pipe(gulp.dest(`${BUILD_DIR}/svg/icons`))
        .pipe(browserSync.stream());
}

module.exports = { spriteMono, spriteMulti };

