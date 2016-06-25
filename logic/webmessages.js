'use strict';

var rolemanager = require('./rolemanager');

// private
var sendMsg = function (io, id, eventName, obj) {
    console.log(eventName + " " + id);
    //io.sockets.sockets[id].emit(eventName, obj);
    io.sockets.to(id).emit(eventName, obj);
};

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
    sendText: function (io, id, eventName, text) {
        var obj = {
            text: text
        };
        sendMsg(io, id, eventName, obj);
    },
    sendStartHelp: function (io, id) {
        var obj = {

        };
        sendMsg(io, id, 'game:start', obj);
    },
    sendRoleInfo: function (io, id, role, name) {
        var obj = {
            role: role,
            name: name,
            id: id
        };
        sendMsg(io, id, 'user:role', obj);
    },
    sendAliveInfo: function (io, id, users) {
        var simplifiedUsers = simplifyUsers(users);
        var obj = {
            users: simplifiedUsers
        }
        sendMsg(io, id, 'game:alive', obj);
    },
    sendDeadInfo: function (io, id, users) {
        var simplifiedUsers = [];
        for (var i = 0; i < users.length; i++) {
            simplifiedUsers.push({
                name: users[i].name,
                role: users[i].role,
                id: users[i].id
            });
        }
        var obj = {
            users: simplifiedUsers
        };
        sendMsg(io, id, 'game:dead', obj);
    },
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
    sendDayPhase: function (io, user, dayCount) {
        var obj = {
            dayCount: dayCount,
        }
        sendMsg(io, user.id, 'game:day', obj);
    }
};
