const express = require('express');
const db = require('./db');
const app = express();
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require('./s3');
const config = require('./config');

//takes the uploaded file
//gives it a unique name of 24 characters (uidSafe)+ the original file extension (path)
//stores it in our /uploads folder
var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

//actually doing the uploading
var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

///////////////////////////////////////////////////////////////////////////

app.use(express.static('./public'));

app.get('/images', (req, res) => {
    db.getImages().then(dbInfo => {
        res.json(dbInfo.rows);
    });
});

app.post('/upload', uploader.single('uploadedFile'), s3.upload, (req, res) => {
    console.log('First middleware function: the image has been uploaded to the /uploads folder. Second middleware function: image has been uploaded to the imageboardspiced bucket on AWS s3 and removed from /uploads folder.');
    //save url, username, title and description in the images table
    db.addImage(
        config.s3Url + req.file.filename,
        req.body.name,
        req.body.title,
        req.body.description
    ).then(({rows}) => {
        res.json(rows[0]);
    });
});

app.listen(8080, () => console.log('Listening!'));
