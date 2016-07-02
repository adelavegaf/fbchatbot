'use strict';

angular.module('mafiaApp').controller('GameController', ['$scope', 'socket', '$mdDialog', '$timeout', function ($scope, socket, $mdDialog, $timeout) {
    var status;
    var actionProperties;
    var sessionId;
    $scope.message;
    $scope.playersInGame;
    $scope.messages;
    $scope.aliveUsers;
    $scope.deadUsers;
    $scope.currentUser;
    $scope.phase;
    $scope.dayCount;

    function initVariables() {
        status = 'disconnected';
        actionProperties = {};
        sessionId = -1;
        $scope.playersInGame = 0;
        $scope.messages = [];
        $scope.aliveUsers = [];
        $scope.deadUsers = [];
        $scope.currentUser = {};
        $scope.phase = "";
        $scope.dayCount = 0;
        $scope.message = {
            text: ''
        };
    }

    function setPlayersMessage(players, message) {
        for (var i = 0; i < players.length; i++) {
            players[i].message = message;
        }
    }

    function matchTargetUsers(tempArray, referenceArray) {
        var match = [];
        for (var i = 0; i < tempArray.length; i++) {
            for (var j = 0; j < referenceArray.length; j++) {
                referenceArray[j].message = '';
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

    function addMessage(alias, text) {
        var listMessage = {
            alias: alias,
            text: text
        };
        $scope.messages.push(listMessage);
    }

    function gameStartMessage() {
        addMessage('Game', 'The game will now start.');
    }

    function showAlert(title, message) {
        $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title(title)
            .textContent(message)
            .ariaLabel('Alert Dialog Demo')
            .ok('Got it!')
        );
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

    $scope.hasRole = function () {
        return typeof $scope.currentUser.role !== 'undefined';
    };

    $scope.isGameActive = function () {
        return $scope.phase.length > 0;
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
        addMessage('Game', data.text);
    });

    socket.on('user:msg', function (data) {
        var parseData = data.text.split(': ');
        var alias = (parseData.length > 1) ? parseData[0] : $scope.currentUser.alias;
        var text = (parseData.length > 1) ? parseData[1] : parseData[0];
        addMessage(alias, text);
    });

    socket.on('user:role', function (data) {
        $scope.currentUser.role = data.role;
        $scope.currentUser.alias = data.name;
        $scope.currentUser.id = data.id;
        $scope.currentUser.actionName = data.actionName;
        $scope.currentUser.alliance = data.alliance;
        $scope.currentUser.nightinfo = data.nightinfo;
        $scope.currentUser.roleDescription = data.description;

        var msg = 'You have been assigned the name ' + data.name + ' and the role ' + data.role + '.';
        addMessage('Game', msg);
    });

    socket.on('user:exit', function (data) {
        $scope.playersInGame--;
        addMessage('Game', data.text);
    });

    socket.on('game:reveal', function (data) {
        addMessage('Game', data.text);
    });

    socket.on('game:start', function (data) {
        status = 'playing';
        var delay = data.delay / 1000;
        addMessage('Game', 'The game will start in ' + delay + ' seconds');
        $timeout(gameStartMessage, data.delay);
    });

    socket.on('game:draw', function (data) {
        showAlert('Game', data.text);
        initVariables();
    });

    socket.on('game:win', function (data) {
        showAlert('Game', data.text);
        initVariables();
    });

    socket.on('game:night', function (data) {
        actionProperties = data;
        $scope.phase = 'Night';
        var targetUsers = matchTargetUsers(actionProperties.targets, $scope.aliveUsers);
        setPlayersMessage(targetUsers, 'click to ' + $scope.currentUser.actionName);
        addMessage('Game', $scope.currentUser.nightinfo);
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
        showAlert('Game', data.text);
    });

    socket.on('game:kill', function (data) {
        showAlert('Game', data.text);
    });

    socket.on('vote:accept', function (data) {
        showAlert('Game', data.text);
    });

    socket.on('vote:denied', function (data) {
        showAlert('Game', data.text);
    });

    socket.on('error', function (data) {
        showAlert('Error', data.text);
    });

    initVariables();
}]);
