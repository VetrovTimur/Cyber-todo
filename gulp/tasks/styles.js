const gulp = require('gulp');
const plumber = require('gulp-plumber');
const notifyError = require('../custom/gulp-notify-error');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer').default;
const cleanCSS = require('gulp-clean-css');
const rev = require('gulp-rev').default;
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { paths, isProd, BUILD_DIR } = require('../config');
const browserSync = require('../browserSync');

function styles() {
    if (isProd) {
        console.log('🔍 Stylelint: проверяем src/scss/...');
        try {
            execSync('npx stylelint "src/scss/**/*.scss"', { stdio: 'inherit' });
            console.log('✅ Stylelint: ошибок нет');
        } catch (err) {
            throw new Error('Stylelint нашёл ошибки — сборка прервана');
        }
    }

    if (!isProd) {
        return gulp.src(paths.styles.src)
            .pipe(plumber({ errorHandler: notifyError('SCSS') }))
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({ cascade: false }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(paths.styles.dest))
            .pipe(browserSync.stream());
    }

    // PROD: с хэшем + манифест
    return gulp.src(paths.styles.src)
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(cleanCSS({ level: 2 }))
        .pipe(rev())
        .pipe(gulp.dest(paths.styles.dest))
        .on('end', () => {
            const manifestPath = path.join(BUILD_DIR, 'rev-manifest.json');
            let manifest = {};
            if (fs.existsSync(manifestPath)) {
                try {
                    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                } catch (e) {
                    manifest = {};
                }
            }

            const cssDir = path.join(BUILD_DIR, 'css');
            if (fs.existsSync(cssDir)) {
                const cssFiles = fs.readdirSync(cssDir).filter(f => /^style[.-][a-z0-9]+\.css$/.test(f));
                if (cssFiles.length > 0) {
                    manifest['css/style.css'] = `css/${cssFiles[0]}`;
                }
            }

            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
        })
        .pipe(browserSync.stream());
}

module.exports = styles;
