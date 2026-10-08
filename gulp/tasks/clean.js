const fs = require('fs').promises;
const path = require('path');
const { BUILD_DIR } = require('../config');

const PRESERVE = ['img', 'fonts', 'svg', 'og-image.jpg', 'og-image.png'];

async function clean() {
    try {
        const items = await fs.readdir(`./${BUILD_DIR}`);
        for (const item of items) {
            if (PRESERVE.includes(item)) continue;
            await fs.rm(path.join(`./${BUILD_DIR}`, item), {
                recursive: true,
                force: true
            });
        }
    } catch (e) {

    }
}

async function cleanAll() {
    return fs.rm(`./${BUILD_DIR}`, { recursive: true, force: true });
}

module.exports = { clean, cleanAll };
