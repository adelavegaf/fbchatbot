var server = require('./server');

// public
module.exports = {
    socketEvents: function (socket) {
        var sessionId = server.getSessionId();
        server.webJoin(socket);
        var playersInGame = server.getNumPlayersGame(sessionId);

        socket.emit('init', {
            playersInGame: playersInGame,
        });

        socket.on('user:msg', function (msg) {
            server.parseWebMessage(socket.id, msg);
        });

        socket.on('user:action', function (properties) {
            server.callGameAction(socket.id, properties, 'web');
        });

        socket.on('disconnect', function () {
            server.exit(socket.id, 'web');
        });
    }
};
