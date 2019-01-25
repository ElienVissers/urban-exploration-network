const express = require('express');
const db = require('./db');
const app = express();
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require('./s3');
const config = require('./config');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(require('body-parser').urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

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
        res.cookie('upvotes', '');
        res.json(dbInfo.rows);
    });
});

app.get('/images/:id/more', (req, res) => {
    Promise.all([
        db.getMoreImages(req.params.id),
        db.getLowestId()
    ]).then(dbInfo => {
        res.json(dbInfo);
    });
});

app.post('/upload', uploader.single('uploadedFile'), s3.upload, (req, res) => {
    // console.log('First middleware function: the image has been uploaded to the /uploads folder. Second middleware function: image has been uploaded to the imageboardspiced bucket on AWS s3 and removed from /uploads folder.');
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

app.get('/image/:id/data', (req, res) => {
    db.getImageData(req.params.id).then((dbInfo) => {
        res.json(dbInfo.rows);
    }).catch(() => {
        res.sendStatus(500);
    });
});

app.get('/image/:id/comments', (req, res) => {
    db.getImageComments(req.params.id).then((dbInfo) => {
        res.json(dbInfo.rows);
    }).catch(() => {
        res.sendStatus(500);
    });
});

app.get('/image/:id/upvotes', (req, res) => {
    db.getImageUpvotes(req.params.id).then((dbInfo) => {
        console.log("dbInfo after getting upvotes: ", dbInfo);
        res.json(dbInfo.rows);
    }).catch(() => {
        res.sendStatus(500);
    });
});

app.post('/comment/:id/add', (req, res) => {
    db.addComment(req.body.name, req.body.text, req.params.id).then((dbInfo) => {
        res.json(dbInfo.rows);
    });
});

app.post('/upvote/:id/add', (req, res) => {
    // check if img id is in cookie
    const upvotes = req.cookies.upvotes.split(','); //converts string to array
    if (upvotes.indexOf(req.params.id) == -1) {
        db.addUpvote(req.params.id).then(() => {
            //add img id to the cookie
            upvotes.push(req.params.id);
            res.cookie('upvotes', upvotes+'');
            return db.getImageUpvotes(req.params.id);
        }).then(dbInfo => {
            console.log("dbInfo after getting upvotes after adding: ", dbInfo);
            res.json(dbInfo.rows);
        });
    } else {
        console.log('the db.addUpvote did not run');
        db.getImageUpvotes(req.params.id).then(dbInfo => {
            console.log("dbInfo after getting upvotes after adding: ", dbInfo);
            res.json(dbInfo.rows);
        });
    }
});

app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(8080, () => console.log('Listening!'));
