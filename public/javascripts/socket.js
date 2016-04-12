io = io.connect();
console.log("socket: browser says ping (1)")
io.emit('ping', {
    some: 'data'
});

io.on('pong', function (data) {
    console.log('socket: server said pong (4)', data);
});
