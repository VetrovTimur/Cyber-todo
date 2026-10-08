const isProd = process.env.NODE_ENV === 'production';
const BUILD_DIR = isProd ? 'build' : 'dist';

const paths = {
    html: { src: ['src/*.html', '!src/favicon.html'], dest: `${BUILD_DIR}/` },
    styles:  { src: 'src/scss/style.scss', dest: `${BUILD_DIR}/css/` },
    scripts: { src: 'src/js/main.js',      dest: `${BUILD_DIR}/js/` },
    images:  { src: 'src/img/**/*.{jpg,jpeg,png,webp,avif}', dest: `${BUILD_DIR}/img/` },
    fonts:   { src: 'src/fonts/**/*.{ttf,otf}', dest: `${BUILD_DIR}/fonts/` },
    svg: {
        iconsMono:   'src/svg/icons/mono/**/*.svg',
        iconsMulti:  'src/svg/icons/multi/**/*.svg',
        content:     'src/svg/content/**/*.svg',
        iconsDest:   `${BUILD_DIR}/svg/icons/`,
        contentDest: `${BUILD_DIR}/svg/content/`
    }
};

const imageSizes = [
    { width: 320,  suffix: '-xs' },
    { width: 640,  suffix: '-sm' },
    { width: 960,  suffix: '-md' },
    { width: 1280, suffix: '-lg' },
    { width: 1920, suffix: '-xl' }
];

const imageFormats = ['webp', 'avif'];
const retinaMultiplier = 2;

const preloadFonts = {
    enabled: true,
    mainFamily: 'Inter',
    weights: [400, 700]
}

const criticalCss = {
    enabled: true,
    mode: 'manual'
};

const site = {
    url: 'https://example.com',
    name: 'Gulp Starter',
    description: 'Готовая сборка с SCSS, esbuild, WebP/AVIF, critical CSS и SEO',
    ogImage: 'og-image.jpg',
    priorities: {
        'index.html': 1.0,
        default: 0.6
    }
};

const schema = {
    enabled: true,
    organization: {
        name: 'Gulp Starter',
        url: 'https://example.com',
        logo: 'https://example.com/og-image.jpg',
        description: 'Готовая сборка с SCSS, esbuild, WebP/AVIF, critical CSS и SEO',
        sameAs: [
            // 'https://t.me/yourchannel',
            // 'https://vk.com/yourpage',
            // 'https://github.com/yourusername'
        ]
    },
    website: {
        name: 'Gulp Starterт',
        url: 'https://example.com',
        searchUrl: 'https://example.com/search?q={search_term_string}'
    }
};

module.exports = {
    paths,
    imageSizes,
    imageFormats,
    retinaMultiplier,
    isProd,
    BUILD_DIR,
    preloadFonts,
    criticalCss,
    site,
    schema
};
