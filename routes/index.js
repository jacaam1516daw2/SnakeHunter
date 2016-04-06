var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = new mongo.Db('SnakeDB', new mongo.Server('localhost', 27017, {}), {});

var user = [{
    userName: ''
}];

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log('index');
    res.render('index', {
        title: 'Snake Hunter'
    });
});

router.post('/login', function (req, res, next) {
    console.log('login');
    user.userName = req.body.nick;

    db.open(function (err, client) {
        client.createCollection("players", function (err, col) {
            client.collection("players", function (err, col) {
                col.insert({
                    player: user.userName,
                    puntos: '0'
                }, function () {});
            });
        });
    });

    res.json(user);
});

module.exports = router;
