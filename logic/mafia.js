'use strict';

var messages = require('./messages');

var names = ['Peyton', 'Sam', 'Alex', 'Morgan', 'Taylor', 'Carter', 'Jessie'];

// WARNING: Change timeouts to real values.

var nightTime = function (session) {
    session.state = 'Night';
    //messages.broadcastText(session.users, 'Night time');
    session.dayCount -= 1;
    setTimeout(function () {
        gameStates(session);
    }, 3000);
};

var votingTime = function (session) {
    session.state = 'Voting';
    var alive = [];
    for (var i = 0; i < session.users.length; i++) {
        if (session.users[i].state === 'alive') {
            alive.push(users[i]);
        }
    }
    messages.broadcastVoting(session.sessionId, session.dayCount, alive);
    setTimeout(function () {
        nightTime(session);
    }, 3000);
};

var dayTime = function (session) {
    session.state = 'Day';
    messages.broadcastDay(session.users);
    setTimeout(function () {
        votingTime(session);
    }, 9000);
};

var finishGame = function (session) {
    session.state = 'finished';
};

var gameStates = function (session) {
    if (session.dayCount === 0) {
        finishGame(session);
        return;
    }
    dayTime(session);
};

var getRandomInt = function (min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};

var assignRoles = function (users) {
    var roles = ['Mafioso', 'Detective', 'Doctor', 'Vigilante', 'Barman', 'Mafioso', 'Mafioso'];
    for (var i = 0; i < users.length; i++) {
        users[i].name = names[i];
        users[i].role = roles.splice(getRandomInt(0, roles.length - 1), 1)[0];
        console.log(roles);
        users[i].state = 'alive';
    }
};

var startGame = function (session) {
    assignRoles(session.users);
    gameStates(session);
};

var mafia = {
    names: names,
    gameStates: gameStates,
    dayTime: dayTime,
    votingTime: votingTime,
    nightTime: nightTime,
    getRandomInt: getRandomInt,
    assignRoles: assignRoles,
    startGame: startGame
};

module.export = mafia;
