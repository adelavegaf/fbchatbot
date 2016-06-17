'use strict';

var rolemanager = require('./rolemanager');

// private
var sendMsg = function (io, id, eventName, obj) {
    io.to(id).emit(eventName, obj);
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
            name: name
        };
        sendMsg(io, id, 'role', obj);
    },
    sendNightPhase: function (io, sessionId, dayCount, user, users) {
        var role = rolemanager.getRole(user.role);
        var targetUsers = role.actiontarget(user, users);
        var obj = {
            id: sessionId,
            dayCount: dayCount,
            targets: targetUsers,
            identifier: user.role
        };
        sendMsg(io, user.id, 'night phase', obj);
    },
    sendVotePhase: function (io, sessionId, dayCount, user, users) {
        var obj = {
            id: sessionId,
            dayCount: dayCount,
            targets: users,
            identifier: "vote"
        };
        sendMsg(io, user.id, 'vote phase', obj);
    },
    sendDayPhase: function (io, user, dayCount) {
        var obj = {
            dayCount: dayCount,
        }
        sendMsg(io, user.id, 'day phase', obj);
    }
};
