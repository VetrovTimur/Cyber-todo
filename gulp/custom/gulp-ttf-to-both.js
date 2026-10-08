const { Transform } = require('stream');
const path = require('path');
const ttf2woff = require('ttf2woff').default || require('ttf2woff');
const ttf2woff2 = require('ttf2woff2').default || require('ttf2woff2');

function gulpTtfToBoth() {
    return new Transform({
        objectMode: true,
        transform(file, enc, cb) {
            if (file.isNull()) {
                cb(null, file);
                return;
            }

            const ext = path.extname(file.path).toLowerCase();

            if (ext !== '.ttf') {
                cb(null, file);
                return;
            }

            const baseName = path.basename(file.path, '.ttf');

            try {
                const ttfBuffer = file.contents;

                const woffBuffer = Buffer.from(ttf2woff(ttfBuffer).buffer);
                const woff2Buffer = ttf2woff2(ttfBuffer);

                const woffFile = file.clone();
                woffFile.path = path.join(path.dirname(file.path), `${baseName}.woff`);
                woffFile.contents = woffBuffer;

                const woff2File = file.clone();
                woff2File.path = path.join(path.dirname(file.path), `${baseName}.woff2`);
                woff2File.contents = woff2Buffer;

                cb(null, woffFile);
                this.push(woff2File);
            } catch (err) {
                cb(err);
            }
        }
    });
}

module.exports = gulpTtfToBoth;
