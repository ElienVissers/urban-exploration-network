const express = require('express');
const db = require('./db');
const app = express();

app.use(express.static('./public'));

app.get('/images', (req, res) => {
    db.getImages().then(dbInfo => {
        console.log("dbInfo: ", dbInfo);
        res.json(dbInfo.rows);
    });
});

app.listen(8080, () => console.log('Listening!'));
