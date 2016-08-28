'use strict';
/**
 * Manages client - server communication.
 */

var fbmessages = require('./fbmessages');
var webmessages = require('./webmessages');

//private
var io = {};

/**
 * A simple message that must be sent to only one user.
 */
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
/**
 * A message that must be sent to ALL the users.
 */
var broadcastMsg = function (users, title, text) {
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        personalMsg(user.id, user.type, title, text);
    }
};

// public
module.exports = {
    /**
     * Sets the IO object for SocketIO conections.
     */
    setIO: function (ioConn) {
        io = ioConn;
    },
    /**
     * Sends the user a prompt to join a game.
     */
    startGame: function (id, type) {
        switch (type) {
            case 'facebook':
                fbmessages.sendStartGame(id);
                break;
            case 'web':

                break;
        }
    },
    /**
     * Sends a user a prompt to exit a game.
     */
    exitGame: function (id, type) {
        switch (type) {
            case 'facebook':
                fbmessages.sendExitGame(id);
                break;
            case 'web':
                break;
        }
    },
    /**
     * Sends a user a message with help information about the game.
     */
    help: function (id, type) {
        switch (type) {
            case 'facebook':
                fbmessages.sendHelp(id);
                break;
            case 'web':
                break;
        }
    },
    /**
     * Sends the user information about ALL the roles in his current game.
     */
    roles: function (user, roles) {
        switch (user.type) {
            case 'facebook':
                fbmessages.sendRoles(user.id, roles);
                break;
            case 'web':
                webmessages.sendRoles(io, user.id, roles);
                break;
        }
    },
    /**
     * Sends te user information about his role.
     */
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
    /**
     * Sends the user information about all alive users in his game session.
     */
    alive: function (user, users) {
        switch (user.type) {
            case 'facebook':
                fbmessages.sendAliveInfo(user.id, users);
                break;
            case 'web':
                webmessages.sendAliveInfo(io, user.id, users);
                break;
        }
    },
    /**
     * Sends the user information about all the dead users in his game session.
     */
    dead: function (user, users) {
        switch (user.type) {
            case 'facebook':
                fbmessages.sendDeadInfo(user.id, users);
                break;
            case 'web':
                webmessages.sendDeadInfo(io, user.id, users);
                break;
        }
    },
    /**
     * Informs the user an error occurred while trying to join a game.
     */
    joinError: function (id, type) {
        var text = 'You are already on a game!';
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    /**
     * Informs the user he is not currently in a game session.
     */
    noGameError: function (id, type) {
        var text = 'You are not on a game!';
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    /**
     * Informs the user he is not allowed to cast the action at this point in the game.
     */
    actionError: function (id, type) {
        var text = 'You are not allowed to cast this action now!';
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    /**
     * Informs the user he is not allowed to cast a specific action because of the current game state.
     */
    gameStateError: function (id, type, state) {
        var text = `The game is not in ${state} phase!`;
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    /**
     * Informs the user that he can't communicate with the other user because he disconnected.
     */
    userNotFoundError: function (id, type) {
        var text = 'The user is no longer online.';
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    /**
     * Informs the user he can't vote for himself
     */
    selfVoteError: function (id, type) {
        var text = "You can't vote for yourself!";
        var title = 'error';
        personalMsg(id, type, title, text);
    },
    /**
     * Informs the user that he can't vote twice in the same voting session.
     */
    doubleVoteError: function (id, type) {
        var text = "You can't vote twice!";
        var title = "error";
        personalMsg(id, type, title, text);
    },
    /**
     * Notifies ALL users in the session that the game has started.
     */
    notifyStart: function (users, durations) {
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            switch (user.type) {
                case 'facebook':
                    fbmessages.sendStartHelp(user.id, durations.startGameDelay);
                    break;
                case 'web':
                    webmessages.sendStartHelp(io, user.id, durations);
                    break;
            }
        }
    },
    /**
     * Notifies ALL users in the session that a new user has joined.
     */
    notifyJoin: function (users) {
        var title = 'user:join';
        var text = `A user has joined. Number of users in session: ${users.length}.`;
        broadcastMsg(users, title, text);
    },
    /**
     * Notifies ALL users in the session that a user has left.
     */
    notifyExit: function (users) {
        var title = 'user:exit';
        var text = `A user has left. Number of users in session: ${users.length}.`;
        broadcastMsg(users, title, text);
    },
    /**
     * Notifies ALL users in the session that the game has ended in a draw.
     */
    notifyDraw: function (users) {
        var title = 'game:draw';
        var text = 'The game has finished in a draw, there are no more turns left.';
        broadcastMsg(users, title, text);
    },
    /**
     * Notifies ALL users in the session that the game was won by 'alliance'.
     */
    notifyWin: function (users, alliance) {
        var title = 'game:win';
        var text = `${alliance} has won!`;
        broadcastMsg(users, title, text);
    },
    /**
     * Notifies ALL users in the session that the voting phase has started.
     */
    notifyVotePhase: function (alive, dead, sessionId, dayCount) {
        for (var i = 0; i < alive.length; i++) {
            var user = alive.splice(0, 1)[0];
            switch (user.type) {
                case 'facebook':
                    fbmessages.sendVotePhase(sessionId, dayCount, user, alive);
                    break;
                case 'web':
                    webmessages.sendVotePhase(io, sessionId, dayCount, user, alive);
                    break;
            }
            alive.push(user);
        }
        for (var i = 0; i < dead.length; i++) {
            var user = dead[i];
            switch (user.type) {
                case 'facebook':
                    fbmessages.sendVotePhase(sessionId, dayCount, user, []);
                    break;
                case 'web':
                    webmessages.sendVotePhase(io, sessionId, dayCount, user, []);
                    break;
            }
        }
    },
    /**
     * Notifies ALL users in the session that the day phase has started.
     */
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
    /**
     * Notifies ALL users in the session who 'from' voted for.
     */
    notifyVote: function (users, from, to, quorum) {
        var title = 'user:vote';
        var text = `${from.name} has voted for ${to.name}. ${to.name} has ${to.vote} votes, needs minimum of ${quorum}.`;
        broadcastMsg(users, title, text);
    },
    /**
     * Notifies ALL users in the session that the night phase has started.
     */
    notifyNightPhase: function (alive, dead, sessionId, dayCount) {
        for (var i = 0; i < alive.length; i++) {
            var user = alive[i];
            switch (user.type) {
                case 'facebook':
                    fbmessages.sendNightPhase(sessionId, dayCount, user, alive);
                    break;
                case 'web':
                    webmessages.sendNightPhase(io, sessionId, dayCount, user, alive);
                    break;
            }
        }

        for (var i = 0; i < dead.length; i++) {
            var user = dead[i];
            switch (user.type) {
                case 'facebook':
                    fbmessages.sendNightPhase(sessionId, dayCount, user, []);
                    break;
                case 'web':
                    webmessages.sendNightPhase(io, sessionId, dayCount, user, []);
                    break;
            }
        }
    },
    /**
     * Notifies ALL users in the session about his role (each user can only see their role info).
     */
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
    /**
     * Notifies ALL users in the session that a player was killed.
     */
    notifyDeath: function (user, users, cause) {
        var title = 'game:kill';
        var text = `${user.name} has been killed by the ${cause}. His role was ${user.role}.`
        broadcastMsg(users, title, text);
    },
    /**
     * Sends a text message to all the other users.
     */
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
    /**
     * Sends user the information about all the roles he can currently know about for sure.
     */
    revealRole: function (user, users) {
        var title = 'game:reveal';
        var text = `${user.name} role was ${user.role}.`;
        broadcastMsg(users, title, text);
    },
    /**
     * Informs a player that his role has changed.
     */
    updateRole: function (user, text) {
        var title = 'game:update';
        personalMsg(user.id, user.type, title, text);
    },
    /**
     * Informs the player about his night ability.
     */
    roleAction: function (user, text) {
        var title = 'game:action';
        personalMsg(user.id, user.type, title, text);
    },
    /**
     * Informs all players that someone was lynched in the voting phase.
     */
    voteAccepted: function (users, votedUser) {
        var title = 'vote:accept';
        var text = `${votedUser.name} has been lynched. Role: ${votedUser.role}.`;
        broadcastMsg(users, title, text);
    },
    /**
     * Informs all players that no one was lynched in the voting phase.
     */
    voteDenied: function (users) {
        var title = 'vote:denied';
        var text = `No one was lynched!`;
        broadcastMsg(users, title, text);
    }
};
