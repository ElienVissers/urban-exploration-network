const spicedPg = require('spiced-pg');
var db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const {dbUser, dbPassword} = require('./secrets');
    db = spicedPg(`postgres:${dbUser}:${dbPassword}@localhost:5432/imageboard`);
}


module.exports.getImages = function() {
    return db.query(
        `SELECT *
        FROM images`
    );
};

module.exports.addImage = function(url, name, title, description) {
    return db.query(
        `INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [url, name, title, description]
    );
};

module.exports.getImageData = function(img_id) {
    return db.query(
        `SELECT *
        FROM images
        WHERE id = $1`,
        [img_id]
    );
};

module.exports.getImageComments = function(img_id) {
    return db.query(
        `SELECT *
        FROM comments
        WHERE img_id = $1`,
        [img_id]
    );
};

module.exports.addComment = function(name, text, img_id) {
    return db.query(
        `INSERT INTO comments (username, comment, img_id)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [name, text, img_id]
    );
};
