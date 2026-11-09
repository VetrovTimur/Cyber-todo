const isProd = process.env.NODE_ENV === 'production';
const BUILD_DIR = isProd ? 'build' : 'dist';

const paths = {
    html: { src: ['src/*.html', '!src/favicon.html'], dest: `${BUILD_DIR}/` },
    styles:  { src: 'src/scss/style.scss', dest: `${BUILD_DIR}/css/` },
    scripts: { src: 'src/js/main.js',      dest: `${BUILD_DIR}/js/` },
    images:  { src: 'src/img/**/*.{jpg,jpeg,png,webp,avif}', dest: `${BUILD_DIR}/img/` },
    fonts: {
        src: 'src/fonts/**/*.{ttf,otf}',
        srcWoff2: 'src/fonts/**/*.woff2',
        dest: `${BUILD_DIR}/fonts/`
    },
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
    url: 'https://your-site.com',
    name: 'Your Project Name',
    description: 'Your project description for SEO',
    ogImage: 'og-image.jpg',
    priorities: {
        'index.html': 1.0,
        default: 0.6
    }
};

const schema = {
    enabled: true,
    organization: {
        name: 'Your Company',
        url: 'https://your-site.com',
        logo: 'https://your-site.com/og-image.jpg',
        description: 'Your company description',
        sameAs: [
            // 'https://t.me/yourchannel',
            // 'https://vk.com/yourpage',
        ]
    },
    website: {
        name: 'Your Project Name',
        url: 'https://your-site.com',
        searchUrl: 'https://your-site.com/search?q={search_term_string}'
    }
};

const faviconsConfig = {
    appName: 'Your Project Name',
    appShortName: 'Project',
    appDescription: 'Your project description',
    developerName: 'Your Name',
    background: '#ffffff',
    theme_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    version: 1.0,
    path: '/favicon'
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
    schema,
    faviconsConfig
};
