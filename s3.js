const knox = require('knox');
const fs = require('fs');
let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in production (eg Heroku) the secrets are environment variables
} else {
    secrets = require('./secrets'); // secrets.json is in .gitignore
}
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'imageboardspiced'
});

module.exports.upload = (req, res, next) => {
    if (!req.file) {
        console.log('multer failed');
        return res.sendStatus(500);
    }
    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });

    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on('response', s3Response => {
        if (s3Response.statusCode == 200) {
            fs.unlink(req.file.path, () => {});
            next();
        } else {
            console.log(s3Response.statusCode);
            res.sendStatus(500);
        }
    });
};
