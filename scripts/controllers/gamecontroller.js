'use strict';

angular.module('mafiaApp').controller('GameController', ['$scope', 'socket', function ($scope, socket) {
    $scope.connecting = false;
    $scope.totalPlayers = 0;
    $scope.playersInGame = 0;
    $scope.connect = function () {
        $scope.connecting = true;
    };

    socket.on('init', function (data) {
        $scope.totalPlayers = data.totalPlayers;
        $scope.playersInGame = data.playersInGame;
    });

    socket.on('user:join', function (data) {

    });

    socket.on('user:vote', function (data) {

    });

    socket.on('user:msg', function (data) {

    });

    socket.on('user:role', function (data) {

    });

    socket.on('user:exit', function (data) {

    });

    socket.on('game:start', function (data) {

    });

    socket.on('game:draw', function (data) {

    });

    socket.on('game:win', function (data) {

    });

    socket.on('game:night', function (data) {

    });

    socket.on('game:day', function (data) {

    });

    socket.on('game:voting', function (data) {

    });

    socket.on('game:action', function (data) {

    });

    socket.on('game:kill', function (data) {

    });

    socket.on('vote:accept', function (data) {

    });

    socket.on('vote:denied', function (data) {

    });

    socket.on('error', function (data) {
        // display angular-material alert.
    });


}]);
