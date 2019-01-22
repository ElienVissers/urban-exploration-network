const express = require('express');
const db = require('./db');
const app = express();
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');

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

///////////////////////////////////////////////////////////////////////////////////////

app.use(express.static('./public'));

app.get('/images', (req, res) => {
    db.getImages().then(dbInfo => {
        res.json(dbInfo.rows);
    });
});

app.post('/upload', uploader.single('uploadedFile'), (req, res) => {
    console.log('post request to /upload'); //this is not showing yet
    console.log("req.body: ", req.body);
    console.log("req.file: ", req.file);

    //next steps: save filename, title, description, name in the images table
    //make new image render automatically on screen (without reloading the page)

});

app.listen(8080, () => console.log('Listening!'));
