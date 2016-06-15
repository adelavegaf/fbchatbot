var server = require('./server');

// public
module.exports = {
    socketEvents: function (socket) {
        var roomId = server.sessionId.toString();
        socket.join(roomId);
        var playersInGame = server.getNumPlayersGame(server.sessionId);
        var totalPlayers = server.getTotalNumPlayers();

        socket.emit('init', {
            totalPlayers: totalPlayers,
            playersInGame: playersInGame,
            sessionId: server.sessionId
        });

        socket.emit('user:join', {

        });

        socket.emit('user:exit', {

        });

        socket.on('send:msg', function (msg) {
            socket.broadcast.emit(msg)
        });

        socket.on('disconnect', function () {

        });
    }
};
