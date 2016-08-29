var server = require('./server');

/**
 * Entry point for the web application.
 */

// public
module.exports = {
    socketEvents: function (socket) {
        /**
         * Handles the behaviour when a user tries to join a game through the web application.
         */
        socket.on('user:join', function (msg) {
            var sessionId = server.getSessionId();
            server.webJoin(socket);
            var playersInGame = server.getNumPlayersGame(sessionId);
            socket.emit('init', {
                playersInGame: playersInGame,
                sessionId: sessionId
            });
        });

        /**
         * Handles the behaviour when a user wants to know which players are alive in his game session.
         */
        socket.on('game:alive', function (msg) {
            server.alive(socket.id, 'web');
        });

        /**
         * Handles the behaviour when a user wants to know which players are dead in his game session.
         */
        socket.on('game:dead', function (msg) {
            server.dead(socket.id, 'web');
        });

        /**
         * Handles the behaviour when a user wants to know which roles are in game and which have been
         * revealed.
         */
        socket.on('game:roles', function (msg) {
            server.roles(socket.id);
        });

        /**
         * Handles the behaviour when a user sends a message.
         */
        socket.on('user:msg', function (msg) {
            if (server.parseWebMessage(socket.id, msg.text)) {
                socket.emit('user:msg', {
                    text: msg.alias + ': ' + msg.text
                });
            }
        });

        /**
         * Handles the behaviour when a user tries to use his action.
         */
        socket.on('user:action', function (properties) {
            server.callGameAction(socket.id, properties, 'web');
        });

        /**
         * Handles the behaviour when a user disconnects.
         */
        socket.on('disconnect', function () {
            server.exit(socket.id, 'web');
        });
    }
};
