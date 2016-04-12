var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert'); //utilitzem assercions

var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/SnakeDB';

var user = [{
    userName: '',
    score: 0
}];

var teen = [];

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log('index');
    teen = [];
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connexió correcta");
        topTeen(db, err, function () {});
    });
    res.render('index', {
        title: 'Snake Hunter'
    });
});

router.post('/login', function (req, res, next) {
    console.log('login');
    user.userName = req.body.nick;
    user.score = 0;
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connexió correcta");
        //afegirPlayers(db, err, function () {});
    });
    res.send({
        top: teen
    });
});

router.post('/stop', function (req, res, next) {
    console.log('stop');
    user.score = req.body.score;
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connexió correcta");
        // afegirScorePlayer(db, err, function () {});
    });
});

var afegirPlayers = function (db, err, callback) {
    db.collection('players').insertOne({
        "player": user.userName,
        "puntos": 0
    });
    assert.equal(err, null);
    console.log("Afegit player a col·lecció players");
    callback();
};

var topTeen = function (db, err, callback) {
    var cursor = db.collection('players').find().sort({
        "puntos": -1
    });
    cursor.each(function (err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            teen.push(doc.player + ': ' + doc.puntos);
        } else {
            callback();
        }
    });
};

var afegirScorePlayer = function (db, err, callback) {
    db.collection('players').updateOne({
        "player": user.userName
    }, {
        $set: {
            "puntos": user.score
        }
    });
    assert.equal(err, null);
    console.log("Insert player en players");
    callback();
};

module.exports = router;
