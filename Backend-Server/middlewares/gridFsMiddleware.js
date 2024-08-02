const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

let gfs;

const conn = mongoose.connection;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

module.exports = {
    uploadFile: (fileStream, fileName, userData) => {
        return new Promise((resolve, reject) => {
            const writeStream = gfs.createWriteStream({
                filename: fileName,
                content_type: 'video/mp4',
                metadata: userData // Store user data as metadata
            });
            fileStream.pipe(writeStream);
            writeStream.on('close', (file) => resolve(file));
            writeStream.on('error', (err) => reject(err));
        });
    },
    gfs
};
