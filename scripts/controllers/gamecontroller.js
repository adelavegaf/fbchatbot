'use strict';

angular.module('mafiaApp').controller('GameController', ['$scope', 'socket', '$mdDialog', '$timeout', function ($scope, socket, $mdDialog, $timeout) {
    var status;
    var actionProperties;
    var sessionId;
    var durations;
    var counterTimeout;
    var loadingTimeout;
    var userColors;
    var chatColors;
    var loadingMsgs;
    $scope.message;
    $scope.playersInGame;
    $scope.messages;
    $scope.aliveUsers;
    $scope.deadUsers;
    $scope.currentUser;
    $scope.phase;
    $scope.dayCount;
    $scope.counter;
    $scope.loadingMsg;

    function initVariables() {
        status = 'disconnected';
        actionProperties = {};
        sessionId = -1;
        durations = {};
        counterTimeout = {};
        loadingTimeout = {};
        userColors = {
            Game: '#ff6666'
        };
        loadingMsgs = {
            init: 'waiting for players',
            status: 'players in lobby: '
        };
        chatColors = ['#d9ff66', '#cc99ff', '#ffcc66', '#cceeff', '#ffccff', '#ffff80', '#ccffcc'];
        $scope.playersInGame = 1;
        $scope.messages = [];
        $scope.aliveUsers = [];
        $scope.deadUsers = [];
        $scope.currentUser = {};
        $scope.phase = '';
        $scope.loadingMsg = ' ';
        $scope.dayCount = 0;
        $scope.counter = 0;
        $scope.message = {
            text: ''
        };
    }

    function clearClicks(players) {
        for (var i = 0; i < players.length; i++) {
            players[i].clicked = false;
        }
    }

    function clearEligible(players) {
        for (var i = 0; i < players.length; i++) {
            players[i].eligible = false;
        }
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

    function onCounterTimeout() {
        if ($scope.counter > 0) {
            $scope.counter--;
        }
        counterTimeout = $timeout(onCounterTimeout, 1000);
    }

    function setLoadingMessage(msg) {
        if (msg === loadingMsgs.init) {
            $scope.loadingMsg = loadingMsgs.status + $scope.playersInGame;
        } else {
            $scope.loadingMsg = loadingMsgs.init;
        }
        loadingTimeout = $timeout(toggleLoadingMessage, 3000);
    }

    function clearLoadingMessage(prevMsg) {
        $scope.loadingMsg = ' ';
        loadingTimeout = $timeout(function () {
            setLoadingMessage(prevMsg);
        }, 510);
    }

    function toggleLoadingMessage() {
        clearLoadingMessage($scope.loadingMsg);
    }

    function cancelCounterTimeout() {
        $timeout.cancel(counterTimeout);
    }

    function cancelLoadingTimeout() {
        $timeout.cancel(loadingTimeout);
    }

    function gameStartMessage() {
        addMessage('Game', 'The game will now start.');
    }

    function pickColor(alias) {
        var color = chatColors.splice(0, 1);
        userColors[alias] = color;
        return color;
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
        if (keyEvent.which === 13 && $scope.message.text.length > 0) {
            socket.emit('user:msg', {
                alias: $scope.currentUser.alias,
                text: $scope.message.text
            });
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

    $scope.loadingStatus = function () {
        return $scope.loadingMsg !== ' ';
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
        $scope.loadingMsg = loadingMsgs.init;
        toggleLoadingMessage();
    };

    $scope.userClick = function (user) {
        if ($scope.phase === 'Day') {
            return;
        }
        if (!user.eligible) {
            return;
        }
        if ($scope.phase === 'Voting') {
            clearEligible($scope.aliveUsers);
        }

        clearClicks($scope.aliveUsers);
        user.clicked = true;

        socket.emit('user:action', {
            sessionId: sessionId,
            action: actionProperties.identifier,
            dayCount: actionProperties.dayCount,
            to: user.id,
            from: $scope.currentUser.id
        });
    };

    $scope.chatColor = function (msg) {
        var index = msg.alias.indexOf(' ');
        var alias = (index === -1) ? msg.alias : msg.alias.substring(0, index);
        var style = {};
        if (userColors[alias]) {
            style['background-color'] = userColors[alias];
        } else {
            style['background-color'] = pickColor(alias);
        }
        return style;
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
        var split = data.text.indexOf(': ');
        var alias = data.text.substring(0, split);
        var text = data.text.substring(split + 2);
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
        socket.emit('game:alive', {});
        socket.emit('game:dead', {});
    });

    socket.on('game:reveal', function (data) {
        addMessage('Game', data.text);
    });

    socket.on('game:start', function (data) {
        cancelLoadingTimeout();
        status = 'playing';
        durations = data.durations;
        var delay = durations.startGameDelay / 1000;
        addMessage('Game', 'The game will start in ' + delay + ' seconds');
        $timeout(gameStartMessage, durations.startGameDelay);
    });

    socket.on('game:draw', function (data) {
        cancelCounterTimeout();
        showAlert('Game', data.text);
        initVariables();
    });

    socket.on('game:win', function (data) {
        cancelCounterTimeout();
        showAlert('Game', data.text);
        initVariables();
    });

    socket.on('game:night', function (data) {
        clearClicks($scope.aliveUsers);
        cancelCounterTimeout();
        $scope.counter = durations.nightDuration / 1000;
        counterTimeout = $timeout(onCounterTimeout, 1000);
        actionProperties = data;
        $scope.phase = 'Night';
        var targetUsers = matchTargetUsers(actionProperties.targets, $scope.aliveUsers);
        setPlayersMessage(targetUsers, $scope.currentUser.actionName);
        addMessage('Game', $scope.currentUser.nightinfo);
    });

    socket.on('game:day', function (data) {
        actionProperties = {};
        cancelCounterTimeout();
        $scope.counter = durations.dayDuration / 1000;
        counterTimeout = $timeout(onCounterTimeout, 1000);
        $scope.phase = 'Day';
        $scope.dayCount = data.dayCount;
        socket.emit('game:alive', {});
        socket.emit('game:dead', {});
    });

    socket.on('game:voting', function (data) {
        clearClicks($scope.aliveUsers);
        cancelCounterTimeout();
        $scope.counter = durations.votingDuration / 1000;
        counterTimeout = $timeout(onCounterTimeout, 1000);
        actionProperties = data;
        $scope.phase = 'Voting';
        var targetUsers = matchTargetUsers(actionProperties.targets, $scope.aliveUsers);
        setPlayersMessage(targetUsers, 'click to vote');
    });

    socket.on('game:alive', function (data) {
        $scope.aliveUsers = data.users;
    });

    socket.on('game:dead', function (data) {
        $scope.deadUsers = data.users;
    });

    socket.on('game:action', function (data) {
        showAlert('Game', data.text);
    });

    socket.on('game:kill', function (data) {
        showAlert('Game', data.text);
    });

    socket.on('vote:accept', function (data) {
        socket.emit('game:alive', {});
        socket.emit('game:dead', {});
        showAlert('Game', data.text);
    });

    socket.on('vote:denied', function (data) {
        addMessage('Game', data.text);
    });

    socket.on('error', function (data) {
        showAlert('Error', data.text);
    });

    initVariables();
            }]);
