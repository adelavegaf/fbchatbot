'use strict';

var rolemanager = require('./rolemanager');

/**
 * Handles the communication between the server and the client.
 */

// private

/**
 * Sends an object to the specified socket with id.
 */
var sendMsg = function (io, id, eventName, obj) {
    io.sockets.to(id).emit(eventName, obj);
};

/**
 * Simplifies the users array to minimize the information sent to the front-end.
 */
var simplifyUsers = function (users) {
    var simplifiedUsers = [];
    for (var i = 0; i < users.length; i++) {
        simplifiedUsers.push({
            name: users[i].name,
            id: users[i].id
        });
    }
    return simplifiedUsers;
};

// public
module.exports = {
    /**
     * Sends an object that only contains a text property to socket with id.
     */
    sendText: function (io, id, eventName, text) {
        var obj = {
            text: text
        };
        sendMsg(io, id, eventName, obj);
    },
    /**
     * Sends an object that contains all start information that is needed by a socket with id.
     */
    sendStartHelp: function (io, id, durations) {
        var obj = {
            durations: durations
        };
        sendMsg(io, id, 'game:start', obj);
    },
    /**
     * Sends all the information related to the role the socket with id was assigned.
     */
    sendRoleInfo: function (io, id, role, name) {
        var roleData = rolemanager.getRole(role);
        var obj = {
            role: role,
            nightinfo: roleData.nightinfo,
            actionName: roleData.actionName,
            description: roleData.description,
            alliance: roleData.alliance,
            name: name,
            id: id
        };
        sendMsg(io, id, 'user:role', obj);
    },
    /**
     * Send information about all the roles that are playing in the game to socket with id.
     */
    sendRoles: function (io, id, roles) {
        var obj = {
            roles: roles
        };
        sendMsg(io, id, 'game:roles', obj);
    },
    /**
     * Sends information about all the users that are still alive in current game to socket with id.
     */
    sendAliveInfo: function (io, id, users) {
        var simplifiedUsers = simplifyUsers(users);
        var obj = {
            users: simplifiedUsers
        }
        sendMsg(io, id, 'game:alive', obj);
    },
    /**
     * Sends information about all the users that are dead in current game to socket with id.
     */
    sendDeadInfo: function (io, id, users) {
        var simplifiedUsers = [];
        for (var i = 0; i < users.length; i++) {
            simplifiedUsers.push({
                name: users[i].name,
                role: (typeof users[i].originalRole === 'undefined') ? users[i].role : users[i].originalRole,
                id: users[i].id
            });
        }
        var obj = {
            users: simplifiedUsers
        };
        sendMsg(io, id, 'game:dead', obj);
    },
    /**
     * Notifies socket with user.id that the night phase has started.
     */
    sendNightPhase: function (io, sessionId, dayCount, user, users) {
        var role = rolemanager.getRole(user.role);
        var targetUsers = simplifyUsers(role.actiontarget(user, users));
        var obj = {
            id: sessionId,
            dayCount: dayCount,
            targets: targetUsers,
            identifier: user.role
        };
        sendMsg(io, user.id, 'game:night', obj);
    },
    /**
     * Notifies socket with user.id that the voting phase has started.
     */
    sendVotePhase: function (io, sessionId, dayCount, user, users) {
        var targetUsers = simplifyUsers(users);
        var obj = {
            id: sessionId,
            dayCount: dayCount,
            targets: targetUsers,
            identifier: "vote"
        };
        sendMsg(io, user.id, 'game:voting', obj);
    },
    /**
     * Notifies socket with user.id that the day phase has started.
     */
    sendDayPhase: function (io, user, dayCount) {
        var obj = {
            dayCount: dayCount,
        }
        sendMsg(io, user.id, 'game:day', obj);
    }
};
