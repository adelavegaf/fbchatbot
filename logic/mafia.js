'use strict';

var names = ['Peyton', 'Sam', 'Alex', 'Morgan', 'Taylor', 'Carter', 'Jessie'];

// WARNING: Change timeouts to real values.


var nightTime = function (game) {
    console.log('night time');
    game.state = 'Night';
    game.dayCount -= 1;
    setTimeout(function () {
        gameStates(game);
    }, 3000);
};

var votingTime = function (game) {
    console.log('voting time');
    game.state = 'Voting';
    setTimeout(function () {
        nightTime(game);
    }, 3000);
};

var dayTime = function (game) {
    console.log('day time');
    game.state = 'Day';
    setTimeout(function () {
        votingTime(game);
    }, 9000);
};

var gameStates = function (game) {
    if (game.dayCount === 0) {
        return;
    }
    dayTime(game);
};

var getRandomInt = function (min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};

var assignRoles = function (users, roles) {
    for (var i = 0; i < users.length; i++) {
        users[i].name = names[i];
        users[i].role = roles.splice(getRandomInt(0, roles.length), 1);
    }
};

var game = function (users) {

    var roles = ['Mafioso', 'Detective', 'Doctor', 'Vigilante', 'Barman', 'Mafioso', 'Mafioso'];

    var game = {
        state: '',
        dayCount: 10
    };

    assignRoles(users, roles);

    gameStates(game);

    return game;
};

var mafia = {
    names: names,
    gameStates: gameStates,
    dayTime: dayTime,
    votingTime: votingTime,
    nightTime: nightTime,
    getRandomInt: getRandomInt,
    assignRoles: assignRoles,
    game: game
};

module.export = mafia;
