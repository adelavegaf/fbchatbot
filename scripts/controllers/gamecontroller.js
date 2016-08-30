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
    $scope.showDescription;
    $scope.roles;
    $scope.aliases;

    function initVariables() {
        status = 'disconnected';
        actionProperties = {};
        sessionId = -1;
        durations = {};
        counterTimeout = {};
        loadingTimeout = {};
        userColors = {
            Game: '#FFB5B5'
        };
        loadingMsgs = {
            init: 'opening 7 tabs and pressing play will start a game for testing purposes.',
            status: 'players in lobby: '
        };
        chatColors = ['#d9ff66', '#cc99ff', '#ffcc66', '#cceeff', '#ffccff', '#ffff80', '#ccffcc'];
        $scope.showDescription = true;
        $scope.playersInGame = 1;
        $scope.messages = [];
        $scope.aliveUsers = [];
        $scope.deadUsers = [];
        $scope.roles = [];
        $scope.aliases = {};
        $scope.currentUser = {};
        $scope.phase = '';
        $scope.loadingMsg = ' ';
        $scope.dayCount = 0;
        $scope.counter = 0;
        $scope.message = {
            text: ''
        };
    }

    function resetGame() {
        initVariables();
    }

    function setCurrentUserState(text) {
        var deadAlias = text.match(/[a-z]+/i)[0];
        if (deadAlias === $scope.currentUser.alias) {
            $scope.currentUser.state = 'dead';
        }
    }

    function clearClicks(players) {
        if (typeof players === 'undefined') {
            return;
        }
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
        if (typeof players === 'undefined') {
            return;
        }
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
        calculateAliases(alias);
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
            $scope.loadingMsg = loadingMsgs.status + $scope.playersInGame + ' out of 7';
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

    function refreshGameStatus() {
        socket.emit('game:alive', {});
        socket.emit('game:dead', {});
        socket.emit('game:roles', {});
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

    function calculateAliases(alias) {
        if (typeof $scope.aliases[alias] === 'undefined') {
            $scope.aliases[alias] = true;
        }
    }

    $scope.openMenu = function ($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
    };

    $scope.sendMessageKey = function (keyEvent) {
        if (keyEvent.which === 13 && $scope.message.text.length > 0) {
            socket.emit('user:msg', {
                alias: $scope.currentUser.alias,
                text: $scope.message.text
            });
            $scope.message.text = '';
        }
    };

    $scope.sendMessage = function () {
        if ($scope.message.text.length > 0) {
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

    $scope.isOwnMessage = function (message) {
        return $scope.currentUser.alias === message.alias;
    };

    $scope.toggleDescription = function () {
        $scope.showDescription = !$scope.showDescription;
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
            setPlayersMessage($scope.aliveUsers, '');
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

    $scope.checkboxColor = function (alias) {
        var style = {};
        style['color'] = userColors[alias];
        return style;
    };

    $scope.canChat = function () {
        if ($scope.currentUser.state === 'alive' && $scope.phase === 'Voting') {
            return false;
        }
        if ($scope.currentUser.state === 'alive' && $scope.phase === 'Night' && $scope.currentUser.alliance !== 'mafia') {
            return false;
        }
        return true;
    };

    $scope.getRoleImage = function (role) {
        return (role.name) ? role.name.toLowerCase() : 'avatar';
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
        $scope.currentUser.state = 'alive';
        var msg = 'You have been assigned the name ' + data.name + ' and the role ' + data.role + '.';
        addMessage('Game', msg);
    });

    socket.on('user:exit', function (data) {
        $scope.playersInGame--;
        if ($scope.phase.length > 0) {
            addMessage('Game', data.text);
            refreshGameStatus();
        }
    });

    socket.on('game:reveal', function (data) {
        addMessage('Game', data.text);
    });

    socket.on('game:start', function (data) {
        cancelLoadingTimeout();
        status = 'playing';
        durations = data.durations;
        var delay = durations.startGameDelay / 1000;
        addMessage('Game', 'The game will start in ' + delay + ' seconds.');
        $timeout(gameStartMessage, durations.startGameDelay);
    });

    socket.on('game:draw', function (data) {
        cancelCounterTimeout();
        addMessage('Game', data.text);
        addMessage('Game', 'The game will close in 10 seconds.');
        showAlert('Game', data.text);
        $timeout(resetGame, 10000);
    });

    socket.on('game:win', function (data) {
        cancelCounterTimeout();
        addMessage('Game', data.text);
        addMessage('Game', 'The game will close in 10 seconds.');
        showAlert('Game', data.text);
        $timeout(resetGame, 10000);
    });

    socket.on('game:night', function (data) {
        clearClicks($scope.aliveUsers);
        cancelCounterTimeout();
        $scope.counter = durations.nightDuration / 1000;
        counterTimeout = $timeout(onCounterTimeout, 1000);
        actionProperties = data;
        $scope.phase = 'Night';
        setPlayersMessage($scope.aliveUsers, ' ');
        var targetUsers = matchTargetUsers(actionProperties.targets, $scope.aliveUsers);
        setPlayersMessage(targetUsers, $scope.currentUser.actionName);
        addMessage('Game', $scope.currentUser.nightinfo);
    });

    socket.on('game:day', function (data) {
        setPlayersMessage($scope.aliveUsers, ' ');
        clearClicks($scope.aliveUsers);
        actionProperties = {};
        cancelCounterTimeout();
        $scope.counter = durations.dayDuration / 1000;
        counterTimeout = $timeout(onCounterTimeout, 1000);
        $scope.phase = 'Day';
        $scope.dayCount = data.dayCount;
        refreshGameStatus();
    });

    socket.on('game:voting', function (data) {
        setPlayersMessage($scope.aliveUsers, ' ');
        clearClicks($scope.aliveUsers);
        cancelCounterTimeout();
        $scope.counter = durations.votingDuration / 1000;
        counterTimeout = $timeout(onCounterTimeout, 1000);
        actionProperties = data;
        $scope.phase = 'Voting';
        var targetUsers = matchTargetUsers(actionProperties.targets, $scope.aliveUsers);
        setPlayersMessage(targetUsers, 'vote');
    });

    socket.on('game:alive', function (data) {
        if ($scope.aliveUsers.length === 0) {
            $scope.aliveUsers = data.users;
            return;
        }
        for (var i = 0; i < $scope.aliveUsers.length; i++) {
            var found = false;
            for (var j = 0; j < data.users.length; j++) {
                if ($scope.aliveUsers[i].name === data.users[j].name) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                $scope.aliveUsers.splice(i, 1);
            }
        }
    });

    socket.on('game:dead', function (data) {
        for (var i = 0; i < data.users.length; i++) {
            var found = false;
            for (var j = 0; j < $scope.deadUsers.length; j++) {
                if (data.users[i].name === $scope.deadUsers[j].name) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                $scope.deadUsers.push(data.users[i]);
            }
        }
    });

    socket.on('game:roles', function (data) {
        $scope.roles = data.roles;
    });

    socket.on('game:action', function (data) {
        addMessage('Game', data.text);
        showAlert('Game', data.text);
    });

    socket.on('game:update', function (data) {
        addMessage('Game', data.text);
        $scope.currentUser.role = 'Mafia Boss';
        $scope.currentUser.actionName = 'Kill';
        showAlert('Game', data.text);
    });

    socket.on('game:kill', function (data) {
        addMessage('Game', data.text);
        setCurrentUserState(data.text);
    });

    socket.on('vote:accept', function (data) {
        refreshGameStatus();
        addMessage('Game', data.text);
        setCurrentUserState(data.text);
    });

    socket.on('vote:denied', function (data) {
        addMessage('Game', data.text);
    });

    socket.on('error', function (data) {
        showAlert('Error', data.text);
    });

    initVariables();
}]);
