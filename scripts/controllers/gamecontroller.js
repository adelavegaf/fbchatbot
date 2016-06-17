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
        alert(data);
    });
}]);
