'use strict';

angular.module('mafiaApp').controller('GameController', ['$scope', 'socket', function ($scope, socket) {
    var status = 'disconnected';
    $scope.message = {
        text: ''
    };
    $scope.playersInGame = 0;
    $scope.messages = [];
    $scope.aliveUsers = [];
    $scope.deadUsers = [];
    $scope.alias = "";
    $scope.role = "";
    $scope.phase = "";
    $scope.dayCount = 0;

    $scope.sendMessage = function (keyEvent) {
        if (keyEvent.which === 13) {
            socket.emit('user:msg', $scope.message.text);
            $scope.message.text = '';
        }
    };

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
    });

    socket.on('user:join', function (data) {
        $scope.playersInGame++;
    });

    socket.on('user:vote', function (data) {

    });

    socket.on('user:msg', function (data) {
        var parseData = data.text.split(': ');
        var listMessage = {
            alias: (parseData.length > 1) ? parseData[0] : $scope.alias,
            text: (parseData.length > 1) ? parseData[1] : parseData[0]
        };
        $scope.messages.push(listMessage);
    });

    socket.on('user:role', function (data) {
        $scope.role = data.role;
        $scope.alias = data.name;
    });

    socket.on('user:exit', function (data) {
        $scope.playersInGame--;
    });

    socket.on('game:start', function (data) {
        status = 'playing';
    });

    socket.on('game:draw', function (data) {
        status = 'draw';
    });

    socket.on('game:win', function (data) {

    });

    socket.on('game:night', function (data) {
        $scope.phase = 'Night';
    });

    socket.on('game:day', function (data) {
        $scope.phase = 'Day';
        $scope.dayCount = data.dayCount;
        socket.emit('game:alive', {});
        socket.emit('game:dead', {});
    });

    socket.on('game:voting', function (data) {
        $scope.phase = 'Voting';
    });

    socket.on('game:alive', function (data) {
        $scope.aliveUsers = data.users;
    });

    socket.on('game:dead', function (data) {
        $scope.deadUsers = data.users;
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
        alert(data);
    });


}]);
