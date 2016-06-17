'use strict';

var fbmessages = require('./fbmessages');
var webmessages = require('./webmessages');

//private
var io = {};

var personalMsg = function (id, type, title, text) {
    switch (type) {
        case 'facebook':
            fbmessages.sendText(id, text);
            break;
        case 'web':
            webmessages.sendText(io, id, title, text);
            break;
    }
};

var broadcastMsg = function (users, title, text) {
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        personalMsg(user.id, user.type, title, text);
    }
};

// public
module.exports = {
    setIO: function (ioConn) {
        io = ioConn;
    },
    startGame: function (id, type) {
        switch (type) {
            case 'facebook':
                fbmessages.sendStartGame(id);
                break;
            case 'web':
                break;
        }
    },
    exitGame: function (id, type) {
        switch (type) {
            case 'facebook':
                fbmessages.sendExitGame(id);
                break;
            case 'web':
                break;
        }
    },
    help: function (id, type) {
        switch (type) {
            case 'facebook':
                fbmessages.sendHelp(id);
                break;
            case 'web':
                break;
        }
    },
    role: function (user) {
        switch (user.type) {
            case 'facebook':
                fbmessages.sendRoleInfo(user.id, user.role, user.name);
                break;
            case 'web':
                webmessages.sendRoleInfo(io, user.id, user.role, user.name);
                break;
        }
    },
    alive: function (user, users) {
        switch (user.type) {
            case 'facebook':
                fbmessages.sendAliveInfo(user.id, users);
                break;
            case 'web':
                break;
        }
    },
    dead: function (user, users) {
        switch (user.type) {
            case 'facebook':
                fbmessages.sendDeadInfo(user.id, users);
                break;
            case 'web':
                break;
        }
    },
    joinError: function (id, type) {
        var text = 'You are already on a game!';
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    noGameError: function (id, type) {
        var text = 'You are not on a game!';
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    actionError: function (id, type) {
        var text = 'You are not allowed to cast this action now!';
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    gameStateError: function (id, type, state) {
        var text = `The game is not in ${state} phase!`;
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    userNotFoundError: function (id, type) {
        var text = 'The user is no longer online';
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    selfVoteError: function (id, type) {
        var text = "You can't vote for yourself";
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    doubleVoteError: function (id, type) {
        var text = "You can't vote twice!";
        var title = "error";
        personalMsg(id, type, title, text);
    },
    notifyStart: function (users) {
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            switch (user.type) {
                case 'facebook':
                    fbmessages.sendStartHelp(user.id);
                    break;
                case 'web':
                    webmessages.sendStartHelp(io, user.id);
                    break;
            }
        }
    },
    notifyJoin: function (users) {
        var title = 'user:join';
        var text = `A user has joined. Number of users in session: ${users.length}`;
        broadcastMsg(users, title, text);
        // Decirles cuantos jugadores hay en el juego apenas alguien más entre.
    },
    notifyExit: function (users) {
        var title = 'user:exit';
        var text = `A user has left. Number of users in session: ${users.length}`;
        broadcastMsg(users, title, text);
        // messages.broadcastText(session.users, `A player has left the game ${session.users.length}/${minNumPlayers}`);
    },
    notifyDraw: function (users) {
        var title = 'game:draw';
        var text = 'The game has finished in a draw, there are no more turns left.';
        broadcastMsg(users, title, text);
    },
    notifyWin: function (users, alliance) {
        var title = 'game:win';
        var text = `${alliance} has won!`;
        broadcastMsg(users, title, text);
    },
    notifyVotePhase: function (users, sessionId, dayCount) {
        for (var i = 0; i < users.length; i++) {
            var user = users.splice(0, 1)[0];
            switch (user.type) {
                case 'facebook':
                    fbmessages.sendVotePhase(sessionId, dayCount, user, users);
                    break;
                case 'web':
                    webmessages.sendVotePhase(io, sessionId, dayCount, user, users);
                    break;
            }
            users.push(user);
        }
    },
    notifyDayPhase: function (users, dayCount) {
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            switch (user.type) {
                case 'facebook':
                    fbmessages.sendDayPhase(user.id, dayCount);
                    break;
                case 'web':
                    webmessages.sendDayPhase(io, user, dayCount);
                    break;
            }
        }
    },
    notifyVote: function (users, from, to, quorum) {
        var title = 'user:vote';
        var text = `${from.name} has voted for ${to.name}. ${to.vote}/${quorum}`;
        broadcastMsg(users, title, text);
    },
    notifyNightPhase: function (users, sessionId, dayCount) {
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            switch (user.type) {
                case 'facebook':
                    fbmessages.sendNightPhase(sessionId, dayCount, user, users);
                    break;
                case 'web':
                    webmessages.sendNightPhase(io, sessionId, dayCount, user, users);
                    break;
            }
        }
    },
    notifyRoles: function (users) {
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            switch (user.type) {
                case 'facebook':
                    fbmessages.sendRoleInfo(user.id, user.role, user.name);
                    break;
                case 'web':
                    webmessages.sendRoleInfo(io, user.id, user.role, user.name);
                    break;
            }
        }
    },
    notifyDeath: function (user, users, cause) {
        var title = 'game:kill';
        var text = `${user.name} has been killed by the ${cause}. His role was ${user.role}`
        broadcastMsg(users, title, text);
    },
    broadcastText: function (id, users, text) {
        var title = 'user:msg';
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (users[i].id === id) {
                continue;
            }
            personalMsg(user.id, user.type, title, text);
        }
    },
    roleAction: function (user, text) {
        var title = 'game:action';
        personalMsg(user.id, user.type, title, text);
    },
    voteAccepted: function (users, votedUser) {
        var title = 'vote:accept';
        var text = `${votedUser.name} has been lynched. Role: ${votedUser.role}`;
        broadcastMsg(users, title, text);
    },
    voteDenied: function (users) {
        var title = 'vote:denied';
        var text = `No one was lynched!`;
        broadcastMsg(users, title, text);
    }
};
