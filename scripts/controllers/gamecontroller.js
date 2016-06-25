'use strict';

angular.module('mafiaApp').controller('GameController', ['$scope', 'socket', function ($scope, socket) {
    var status = 'disconnected';
    var actionProperties = {};
    var sessionId = -1;
    $scope.message = {
        text: ''
    };
    $scope.playersInGame = 0;
    $scope.messages = [];
    $scope.aliveUsers = [];
    $scope.deadUsers = [];
    $scope.currentUser = {};
    $scope.phase = "";
    $scope.dayCount = 0;

    function setPlayersMessage(players, message) {
        for (var i = 0; i < players.length; i++) {
            players[i].message = message;
        }
    }

    function matchTargetUsers(tempArray, referenceArray) {
        var match = [];
        for (var i = 0; i < tempArray.length; i++) {
            for (var j = 0; j < referenceArray.length; j++) {
                if (tempArray[i].id === referenceArray[j].id) {
                    referenceArray[j].eligible = true;
                    match.push(referenceArray[j]);
                } else if (!referenceArray[j].eligible) {
                    referenceArray[j].eligible = false;
                }
            }
        }
        return match;
    }

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

    $scope.userClick = function (user) {
        if ($scope.phase === 'Day') {
            return;
        }
        if (!user.eligible) {
            return;
        }
        socket.emit('user:action', {
            sessionId: sessionId,
            action: actionProperties.identifier,
            dayCount: actionProperties.dayCount,
            to: user.id,
            from: $scope.currentUser.id
        });
    };

    socket.on('init', function (data) {
        $scope.playersInGame = data.playersInGame;
        sessionId = data.sessionId;
    });

    socket.on('user:join', function (data) {
        $scope.playersInGame++;
    });

    socket.on('user:vote', function (data) {
        var listMessage = {
            alias: 'Game',
            text: data.text
        };
        $scope.messages.push(listMessage);
    });

    socket.on('user:msg', function (data) {
        var parseData = data.text.split(': ');
        var listMessage = {
            alias: (parseData.length > 1) ? parseData[0] : $scope.currentUser.alias,
            text: (parseData.length > 1) ? parseData[1] : parseData[0]
        };
        $scope.messages.push(listMessage);
    });

    socket.on('user:role', function (data) {
        $scope.currentUser.role = data.role;
        $scope.currentUser.alias = data.name;
        $scope.currentUser.id = data.id;
    });

    socket.on('user:exit', function (data) {
        $scope.playersInGame--;
        var listMessage = {
            alias: 'Game',
            text: data.text
        };
        $scope.messages.push(listMessage);
    });

    socket.on('game:reveal', function (data)) {

    };

    socket.on('game:start', function (data) {
        status = 'playing';
    });

    socket.on('game:draw', function (data) {
        status = 'draw';
        alert('draw');
    });

    socket.on('game:win', function (data) {
        status = 'win';
        alert('win');
    });

    socket.on('game:night', function (data) {
        actionProperties = data;
        $scope.phase = 'Night';
        var targetUsers = matchTargetUsers(actionProperties.targets, $scope.aliveUsers);
        setPlayersMessage(targetUsers, 'click to action');
    });

    socket.on('game:day', function (data) {
        actionProperties = {};
        $scope.phase = 'Day';
        $scope.dayCount = data.dayCount;
        socket.emit('game:alive', {});
        socket.emit('game:dead', {});
    });

    socket.on('game:voting', function (data) {
        actionProperties = data;
        $scope.phase = 'Voting';
        var targetUsers = matchTargetUsers(actionProperties.targets, $scope.aliveUsers);
        setPlayersMessage(targetUsers, 'click to vote');
    });

    socket.on('game:alive', function (data) {
        setPlayersMessage(data.users, 'Alive');
        $scope.aliveUsers = data.users;
    });

    socket.on('game:dead', function (data) {
        setPlayersMessage(data.users, 'Dead');
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
        alert(data.text);
    });


}]);
