'use strict';

/**
 * Returns all users except user.
 */
var getOtherUsers = function (user, users) {
    var targets = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i] === user) {
            continue;
        }
        targets.push(users[i]);
    }
    return targets;
};

/**
 * Returns all users that are part of alliance.
 */
var getSameAllianceUsers = function (alliance, users) {
    var targets = [];
    for (var i = 0; i < users.length; i++) {
        if (roles[users[i].role].alliance === alliance) {
            targets.push(users[i]);
        }
    }
    return targets;
};

/**
 * The night action can be performed on all users that
 * are in a different alliance.
 */
var getOtherAllianceUsers = function (alliance, users) {
    var targets = [];
    for (var i = 0; i < users.length; i++) {
        if (roles[users[i].role].alliance !== alliance) {
            targets.push(users[i]);
        }
    }
    return targets;
};

/**
 * Checks if the user is blocked before executing his night action.
 */
var checkBlock = function (from) {
    if (from.state === 'blocked') {
        return true;
    }
    return false;
};

/**
 * Checks if the target of the night action is still connected.
 */
var checkConnected = function (to) {
    if (to === null) {
        return false;
    }
    return true;
};

/**
 * Checks whether the night action can be carried out.
 */
var satisfiesConditions = function (from, to, messagemanager) {
    if (!checkConnected(to)) {
        messagemanager.userNotFoundError(from.id, from.type);
        return false;
    } else if (checkBlock(from)) {
        messagemanager.roleAction(from, `You were roleblocked by the bartender.`);
        return false;
    }
    return true;
};
/**
 * Roles are sorted in order of skill precedence, i.e. block must be executed before any other skill.
 * id: determines ordering. Lower id values determine higher precedence.
 * alliance: describes to which town faction the role corresponds to.
 * description: message the user receives upon starting the game (or calling .role).
 * nightinfo: message the user receives at the beginning of the night phase.
 * action: function, that returns a function, that handles how the night skill
 * of the particular role is executed.
 * actiontarget: to which group of users can the action be cast upon.
 */
var roles = {
    'Barman': {
        'id': 0,
        'alliance': 'town',
        'description': "Block another person's ability each night.",
        'nightinfo': 'Choose who you want to block.',
        'actionName': 'Roleblock',
        'action': function (from, to) {
            return function (messagemanager, users) {
                if (satisfiesConditions(from, to, messagemanager)) {
                    to.state = 'blocked';
                    messagemanager.roleAction(from, `You roleblocked ${to.name}`);
                }
            }
        },
        'actiontarget': function (user, users) {
            return getOtherUsers(user, users);
        }
    },
    'Doctor': {
        'id': 1,
        'alliance': 'town',
        'description': 'Prevent someone from dying each night.',
        'nightinfo': 'Choose who you want to save.',
        'init': function (user) {
            user.selfHeal = 1;
        },
        'actionName': 'Save',
        'action': function (from, to) {
            return function (messagemanager, users) {
                if (!satisfiesConditions(from, to, messagemanager)) {
                    return;
                } else if (from === to && from.selfHeal > 0) {
                    from.selfHeal--;
                    from.state = 'healed';
                    messagemanager.roleAction(from, `You have ${from.selfHeal} self heals left`);
                } else if (from !== to) {
                    to.state = 'healed';
                    messagemanager.roleAction(from, `You have healed ${to.name}`);
                }
            }
        },
        'actiontarget': function (user, users) {
            if (user.selfHeal > 0) {
                return users;
            } else {
                return getOtherUsers(user, users);
            }
        }
    },
    'Mafia Boss': {
        'id': 2,
        'alliance': 'mafia',
        'description': 'Choose who to kill each night.',
        'nightinfo': 'Choose who to kill',
        'actionName': 'Kill',
        'action': function (from, to) {
            return function (messagemanager, users) {
                if (!satisfiesConditions(from, to, messagemanager)) {
                    return;
                } else if (roles[to.role].alliance === 'mafia') {
                    messagemanager.roleAction(from, `You can't kill someone in the mafia.`);
                } else if (to.state === 'healed') {
                    messagemanager.roleAction(from, `${to.name} was saved by the doctor.`);
                    for (var i = 0; i < users.length; i++) {
                        if (users[i].role === 'Doctor') {
                            messagemanager.roleAction(users[i], `${to.name} was attacked by the mafia and you saved him!`);
                        }
                    }
                    messagemanager.roleAction(to, `The mafia targeted you but you were saved by the doctor.`);
                } else {
                    to.state = 'dead';
                    messagemanager.notifyDeath(to, users, 'mafia');
                }
            }
        },
        'actiontarget': function (user, users) {
            return getOtherAllianceUsers('mafia', users);
        }
    },
    'Fixer': {
        'id': 3,
        'alliance': 'mafia',
        'description': 'Disguise a mobster as a town member by switching his role at night.',
        'nightinfo': 'Your target will appear as a member of the town and not mafia.',
        'init': function (user) {
            user.fixed = 2;
        },
        'actionName': 'Fix',
        'action': function (from, to) {
            return function (messagemanager, users) {
                if (!satisfiesConditions(from, to, messagemanager)) {
                    return;
                } else if (from.fixed > 0) {
                    to.state = 'fixed';
                    from.fixed--;
                    messagemanager.roleAction(from, `You fixed ${to.name}. ${from.fixed} fixes remaining.`);
                    messagemanager.roleAction(to, `Someone fixed you.`);
                } else {
                    messagemanager.roleAction(from, 'You are out of fixes');
                }
            }
        },
        'actiontarget': function (user, users) {
            if (user.fixed > 0) {
                return getSameAllianceUsers('mafia', users);
            } else {
                return [];
            }
        }
    },
    'Detective': {
        'id': 4,
        'alliance': 'town',
        'description': "Learn another person's role each night.",
        'nightinfo': 'Choose who you want to investigate.',
        'actionName': 'Inspect',
        'action': function (from, to) {
            return function (messagemanager, users) {
                if (!satisfiesConditions(from, to, messagemanager)) {
                    return;
                } else if (to.state === 'fixed') {
                    for (var i = 0; i < users.length; i++) {
                        if (users[i].alliance === 'town' && users[i].role !== 'Detective') {
                            messagemanager.roleAction(from, `Investigation Result: ${to.name}'s role is ${users[i].role}`);
                            return;
                        }
                    }
                    messagemanager.roleAction(from, `Investigation Result: ${to.name}'s role is Doctor`);
                } else {
                    messagemanager.roleAction(from, `Investigation Result: ${to.name}'s role is ${to.role}`);
                }
            }
        },
        'actiontarget': function (user, users) {
            return getOtherUsers(user, users);
        }
    },
    'Vigilante': {
        'id': 5,
        'alliance': 'town',
        'description': 'You may only kill one player in the name of justice.',
        'nightinfo': 'Choose who you want to kill.',
        'actionName': 'Kill',
        'init': function (user) {
            user.kill = 1;
        },
        'action': function (from, to) {
            return function (messagemanager, users) {
                if (!satisfiesConditions(from, to, messagemanager)) {
                    return;
                } else if (to.state === 'healed') {
                    messagemanager.roleAction(from, `${to.name} was saved by the doctor.`);
                    messagemanager.roleAction(to, `The vigilante targeted you but you were saved by the doctor.`);
                } else if (from.kill > 0) {
                    from.kill--;
                    to.state = 'dead';
                    messagemanager.notifyDeath(to, users, 'vigilante');
                }
            }
        },
        'actiontarget': function (user, users) {
            return getOtherUsers(user, users);
        }
    },
    'Mafioso': {
        'id': 6,
        'alliance': 'mafia',
        'description': 'Second in line when boss dies.',
        'nightinfo': 'You can speak to the mafia.',
        'actionName': 'Advise',
        'action': function (from, to) {
            return function (messagemanager, users) {
                if (satisfiesConditions(from, to, messagemanager)) {}
            }
        },
        'actiontarget': function (user, users) {
            return [];
        }
    }
};

/**
 * Adds an action to the nightAction array in the
 * corresponding role position.
 */
var nightAction = function (session, properties) {
    var role = roles[properties.action];
    var id = role.id;
    var actions = session.nightActions;
    actions[id] = role['action'](properties.from, properties.to);
};
/**
 * Returns an array with all the roles available in the game.
 */
var getRoleNames = function () {
    var roleNames = [];
    for (var property in roles) {
        if (roles.hasOwnProperty(property)) {
            roleNames.push(property);
        }
    }
    return roleNames;
};
/**
 * Returns a role object given the role name.
 */
var getRole = function (role) {
    return roles[role];
};

/**
 * pre: Mafia Boss should be dead.
 * post: Searches within mafia for the new mafia boss.
 */
var findNewMafiaBoss = function (mafiosos, messagemanager) {
    for (var i = 0; i < mafiosos.length; i++) {
        var mafioso = mafiosos[i];
        if (mafioso.role === 'Mafioso' && mafioso.state === 'alive') {
            mafioso.originalRole = 'Mafioso';
            mafioso.role = 'Mafia Boss';
            messagemanager.updateRole(mafioso, 'You are now the Mafia Boss');
            return true;
        }
    }
    for (var i = 0; i < mafiosos.length; i++) {
        var mafioso = mafiosos[i];
        if (mafioso.role === 'Fixer' && mafioso.state === 'alive') {
            mafioso.originalRole = 'Fixer';
            mafioso.role = 'Mafia Boss';
            messagemanager.updateRole(mafioso, 'You are now the Mafia Boss');
            return true;
        }
    }
    return false;
};

/**
 * Node export object.
 */
var rolemanager = {
    getOtherUsers: getOtherUsers,
    getSameAllianceUsers: getSameAllianceUsers,
    getOtherAllianceUsers: getOtherAllianceUsers,
    checkBlock: checkBlock,
    checkConnected: checkConnected,
    satisfiesConditions: satisfiesConditions,
    roles: roles,
    nightAction: nightAction,
    getRoleNames: getRoleNames,
    getRole: getRole,
    findNewMafiaBoss: findNewMafiaBoss
};

module.exports = rolemanager;
