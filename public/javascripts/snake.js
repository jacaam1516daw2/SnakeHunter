$(function () {
    $('#add-login').click(function () {
        $('#login').hide();
        user = $('#add-nick').val();
        $('<li>').appendTo('h3').text(user);
        $.ajax({
            type: "POST",
            url: "/login",
            data: JSON.stringify({
                nick: user
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                $('#player li').remove();
                for (var i = 0; i < data.top.length; i++) {
                    $('<li>').appendTo('#player').text(data.top[i]);
                    if (i == 9)
                        break;
                }
            },
        });
    });
});

$(function () {
    $('#add-stop').click(function () {
        $('canvas').remove();
        var puntos = $('#score').text();
        $.ajax({
            type: "POST",
            url: "/stop",
            data: JSON.stringify({
                score: puntos
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    });
});

var ctx;
var color = "#00ff00";

function init() {
    $('canvas').remove();

    var turn = [];

    var xV = [-1, 0, 1, 0];
    var yV = [0, -1, 0, 1];
    var queue = [];

    var elements = 1;
    var map = [];

    var MR = Math.random;

    var X = 5 + (MR() * (65 - 10)) | 0;
    var Y = 5 + (MR() * (40 - 10)) | 0;

    var direction = MR() * 3 | 0;

    var interval = 0;

    var score = 0;
    var inc_score = 50;

    var sum = 0,
        easy = 0;

    var i, dir;

    var win = window;
    var doc = document;

    function stop() {
        interval = 1;
    }

    var canvas = doc.createElement('canvas');

    //si pulsamos otra vez el espacio reanudamos el juego
    var setInt = win.setInterval;
    //Si pulsamos la barra de espacio hacemos una pausa en el juego parando el interval
    var clInt = win.clearInterval;
    doc.getElementById("color").style.backgroundColor = color;

    for (i = 0; i < 65; i++) {
        map[i] = [];
    }

    canvas.setAttribute('width', 65 * 10);
    canvas.setAttribute('height', 40 * 10);

    ctx = canvas.getContext('2d');

    doc.body.appendChild(canvas);

    function placeFood() {
        var x, y;
        do {
            x = MR() * 65 | 0;
            y = MR() * 40 | 0;
        } while (map[x][y]);

        map[x][y] = 1;
        ctx.strokeStyle = "#ffff00"; //dame_color_aleatorio();
        ctx.strokeRect(x * 10 + 1, y * 10 + 1, 10 - 2, 10 - 2);
    }
    placeFood();

    function clock() {
        if (easy) {
            X = (X + 65) % 65;
            Y = (Y + 40) % 40;
        }
        --inc_score;
        //compropvamos la dirección de la serpiente
        if (turn.length) {
            dir = turn.pop();
            if ((dir % 2) !== (direction % 2)) {
                direction = dir;
            }
        }
        if ((easy || (0 <= X && 0 <= Y && X < 65 && Y < 40)) && 2 !== map[X][Y]) {
            if (1 === map[X][Y]) {
                score += Math.max(5, inc_score);
                inc_score = 50;
                placeFood();
                elements++;
            }

            //pintamos nueva posicion de la serpiente en cada vuelta
            pintaSerp(X, Y);
            emitSnake(X, Y);

            map[X][Y] = 2;
            queue.unshift([X, Y]);
            X += xV[direction];
            Y += yV[direction];
            if (elements < queue.length) {
                dir = queue.pop()

                map[dir[0]][dir[1]] = 0;
                ctx.fillStyle = color;
                //borramos la antigua posicion de la serpiente
                borraSerp(dir[0], dir[1]);
                emitClearSnake(dir[0], dir[1]);
            }
        } else if (!turn.length) {
            doc.getElementById("color").style.backgroundColor = color;
            ctx.fillStyle = color;
            borraSerpMorta();
            emitClearSnakeDead();
            queue = [];

            elements = 1;
            map = [];

            X = 5 + (MR() * (65 - 10)) | 0;
            Y = 5 + (MR() * (40 - 10)) | 0;

            direction = MR() * 3 | 0;

            score = 0;
            inc_score = 50;

            for (i = 0; i < 65; i++) {
                map[i] = [];
            }

            placeFood();
        }
        doc.getElementById("score").innerHTML = score;
    }
    //velocitat
    interval = setInt(clock, 120);

    doc.onkeydown = function (e) {
        //recuperamos la dirección que se ha pulsado
        var code = e.keyCode - 37;

        /*
         * 0: left
         * 1: up
         * 2: right
         * 3: down
         **/
        //lo añadimos en la lista de direcciones
        if (0 <= code && code < 4 && code !== turn[0]) {
            turn.unshift(code);
        } else if (-5 == code) {
            $('canvas').remove();
            //Si pulsamos la barra de espacio hacemos una pausa en el juego
            // parando el interval
            if (interval) {
                clInt(interval);
                interval = 0;
            } else {
                //si pulsamos otra vez el espacio reanudamos el juego
                interval = setInt(clock, 120);
            }
        } else {
            dir = sum + code;
            if (dir == 44 || dir == 94 || dir == 126 || dir == 171) {
                sum += code
            } else if (dir === 218) easy = 1;
        }
    }
}

function borraSerp(dir1, dir2) {
    ctx.clearRect(dir1 * 10, dir2 * 10, 10, 10);
}

function borraSerpMorta() {
    ctx.clearRect(0, 0, 650, 400);
}

function pintaSerp(X, Y) {
    ctx.fillStyle = color;
    ctx.fillRect(X * 10, Y * 10, 10 - 1, 10 - 1);
}

function pintaSerpServidor(X, Y) {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(X * 10, Y * 10, 10 - 1, 10 - 1);
}

function emitSnake(x, y) {
    var data = {
        x: x,
        y: y
    };
    io.emit('pintaSerpServidor', data)
}

function emitClearSnakeDead() {
    var data = {};
    io.emit('borraSerpMorta', data)
}

function emitClearSnake(dir1, dir2) {
    var data = {
        dir1: dir1,
        dir2: dir2
    };
    io.emit('borraSerp', data)
}

io.on('pintaSerpServidor', function (data) {
    pintaSerpServidor(data.x, data.y);
})

io.on('borraSerp', function (data) {
    borraSerp(data.dir1, data.dir2);
})

io.on('borraSerpMorta', function (data) {
    borraSerpMorta(data.x, data.y);
})
