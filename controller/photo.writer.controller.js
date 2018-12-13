let fs = require('fs');
let imageProcessor = require('./image.processor');

let photoWriter = (payload) => {
    return new Promise(resolve => {
        let now = new Date().getTime();
        let data = payload.photo;
        let filename = `${payload.id}_${now}.jpg`;
        let dir = `/var/www/photo1.spider.com.ng/html/spider/${payload.document}/`;

        let base64Data = data.replace(/^data:image\/\w+;base64,/, "");
        let binaryData = Buffer.from(base64Data, 'base64');

        let wstream = fs.createWriteStream(dir + filename);
        wstream.on('finish', () => {
            imageProcessor(`${dir}${filename}`);
            resolve({ success: true, filename: filename });
        });
        wstream.write(binaryData);
        wstream.end();
    });

}

exports.photoWriter = photoWriter;