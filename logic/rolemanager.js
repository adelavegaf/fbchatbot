'use strict';

var messages = require('./messages');
/**
 * Roles are sorted in order of skill precedence, i.e. block must be executed before any other skill.
 * This influences on how the night actions execute. Each role's id in the array corresponds to each skill's preedence.
 * Barman's block (id 0) executes before Mafia's  
 */
var roles = {
    'Barman': {
        'id': 0,
        'alliance': 'town',
        'description': "Block another person's ability each night.",
        'nightinfo': 'Choose who you want to block.',
        'action': function (users, properties) {
            if (from.state === 'blocked') {
                sendText(from.id, `You were roleblocked by the bartender.`);
            } else {
                sendText(from.id, `$You roleblocked {to.name}`);
            }
        }
    },
    'Doctor': {
        'id': 1,
        'alliance': 'town',
        'description': 'Prevent someone from dying each night.',
        'nightinfo': 'Choose who you want to save.',
        'action': function (users, properties) {
            if (from.state === 'blocked') {
                sendText(from.id, `You were roleblocked by the bartender.`);
            } else {
                to.state = 'healed';
            }
        }
    },
    'Mafia Boss': {
        'id': 2,
        'alliance': 'mafia',
        'description': 'Choose who to kill each night.',
        'nightinfo': 'Choose who to kill',
        'action': function (users, properties) {
            if (from.state === 'blocked') {
                sendText(from.id, `You were roleblocked by the bartender.`);
            } else if (to.state === 'healed') {
                sendText(from.id, `${to.name} was saved by the doctor.`);
                sendText(to.id, `The mafia targeted you but you were saved by the doctor.`);
            } else {
                to.state = 'dead';
                broadcastText(users, `${to.name} has been killed by the mafia. His role was ${to.role}`);
            }
        }
    },
    'Detective': {
        'id': 3,
        'alliance': 'town',
        'description': "Learn another person's role each night.",
        'nightinfo': 'Choose who you want to investigate.',
        'action': function (users, properties) {
            if (from.state === 'blocked') {
                sendText(from.id, `You were roleblocked by the bartender.`);
            } else {
                sendText(from.id, `Investigation Result: ${to.name}'s role is ${to.role}`);
            }
        }
    },
    'Vigilante': {
        'id': 4,
        'alliance': 'town',
        'description': 'Kill someone each night in the name of justice.',
        'nightinfo': 'Choose who you want to kill.',
        'action': function (users, properties) {
            if (properties.from.state === 'blocked') {
                sendText(properties.from.id, `You were roleblocked by the bartender.`);
            } else if (properties.to.state === 'healed') {
                sendText(properties.from.id, `${properties.to.name} was saved by the doctor.`);
                sendText(properties.to.id, `The vigilante targeted you but you were saved by the doctor.`);
            } else {
                properties.to.state = 'dead';
                broadcastText(users, `${properties.to.name} has been killed by the vigilante. His role was ${properties.to.role}`);
            }
        }
    },
    'Mafioso': {
        'id': 5,
        'alliance': 'mafia',
        'description': 'Advise Boss who to kill each night.',
        'nightinfo': 'You can speak to the mafia.',
        'action': function (users, properties) {
            if (properties.from.state === 'blocked') {
                sendText(properties.from.id, `You were roleblocked by the bartender.`);
            }
        }
    }
};

var nightAction = function (session, properties) {
    var role = roles[properties.action];
    console.log('acquired role ' + role);
    var id = role.id;
    console.log('got role id ' + id);
    var actions = session.nightActions;
    console.log('got actions: ' + actions);
    actions[id] = role.action(session.users, properties);
    console.log('got action ' + actios[id]);
};

var getRoleNames = function () {
    var roleNames = [];
    for (var property in roles) {
        if (roles.hasOwnProperty(property)) {
            roleNames.push(property);
        }
    }
    return roleNames;
};

var getRole = function (role) {
    return roles[role];
};

var rolemanager = {
    roles: roles,
    nightAction: nightAction,
    getRoleNames: getRoleNames,
    getRole: getRole,
};

module.exports = rolemanager;
