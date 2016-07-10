var server = require('./server');

// public
module.exports = {
    socketEvents: function (socket) {
        socket.on('user:join', function (msg) {
            var sessionId = server.getSessionId();
            server.webJoin(socket);
            var playersInGame = server.getNumPlayersGame(sessionId);
            socket.emit('init', {
                playersInGame: playersInGame,
                sessionId: sessionId
            });
        });

        socket.on('game:alive', function (msg) {
            server.alive(socket.id, 'web');
        });

        socket.on('game:dead', function (msg) {
            server.dead(socket.id, 'web');
        });

        socket.on('user:msg', function (msg) {
            if (server.parseWebMessage(socket.id, msg.text)) {
                socket.emit('user:msg', {
                    text: msg.alias + ': ' + msg.text
                });
            }
        });

        socket.on('user:action', function (properties) {
            server.callGameAction(socket.id, properties, 'web');
        });

        socket.on('disconnect', function () {
            server.exit(socket.id, 'web');
        });
    }
};
