const gulp = require('gulp');
const { execSync } = require('child_process');
const plumber = require('gulp-plumber');
const { gulpEsbuild } = require('gulp-esbuild');
const rev = require('gulp-rev').default;
const fs = require('fs');
const path = require('path');
const { paths, isProd, BUILD_DIR } = require('../config');
const browserSync = require('../browserSync');

function scripts() {
    if (isProd) {
        console.log('🔍 ESLint: проверяем src/js/...');
        try {
            execSync('npx eslint src/js', { stdio: 'inherit' });
            console.log('✅ ESLint: ошибок нет');
        } catch (err) {
            throw new Error('ESLint нашёл ошибки — сборка прервана');
        }
    }

    if (!isProd) {
        return gulp.src(paths.scripts.src)
            .pipe(plumber())
            .pipe(gulpEsbuild({
                entryPoints: ['src/js/main.js'],
                bundle: true,
                minify: true,
                sourcemap: true
            }))
            .pipe(gulp.dest(paths.scripts.dest))
            .pipe(browserSync.stream());
    }

    return gulp.src(paths.scripts.src)
        .pipe(plumber())
        .pipe(gulpEsbuild({
            entryPoints: ['src/js/main.js'],
            bundle: true,
            minify: true,
            sourcemap: false
        }))
        .pipe(rev())
        .pipe(gulp.dest(paths.scripts.dest))
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

            const jsDir = path.join(BUILD_DIR, 'js');
            if (fs.existsSync(jsDir)) {
                const jsFiles = fs.readdirSync(jsDir).filter(f => /^main[.-][a-z0-9]+\.js$/.test(f));
                if (jsFiles.length > 0) {
                    manifest['js/main.js'] = `js/${jsFiles[0]}`;
                }
            }

            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
        })
        .pipe(browserSync.stream());
}

module.exports = scripts;
