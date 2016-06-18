'use strict';

angular.module('mafiaApp').controller('GameController', ['$scope', 'socket', function ($scope, socket) {
    var status = 'disconnected';
    $scope.playersInGame = 0;

    $scope.isDisconnected = function () {
        return status === 'disconnected';
    };

    $scope.isConnecting = function () {
        return status === 'connecting';
    };

    $scope.isConnected = function () {
        return status === 'connected';
    };

    $scope.isPlaying = function () {
        return status === 'playing';
    };

    $scope.connect = function () {
        status = 'connecting';
        socket.emit('user:join', {});
    };

    socket.on('init', function (data) {
        $scope.playersInGame = data.playersInGame;
        status = 'connected';
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
        status = 'playing';
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
