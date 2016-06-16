var server = require('./server');

// public
module.exports = {
    socketEvents: function (socket) {
        var sessionId = server.getSessionId();
        server.webJoin(socket);
        var playersInGame = server.getNumPlayersGame(sessionId);
        var totalPlayers = server.getTotalNumPlayers();

        socket.emit('init', {
            totalPlayers: totalPlayers,
            playersInGame: playersInGame,
            sessionId: server.sessionId
        });

        socket.on('send:msg', function (msg) {
            socket.broadcast.emit(msg)
        });

        socket.on('disconnect', function () {

        });
    }
};
