'use strict';

angular.module('mafiaApp').controller('GameController', ['$scope', 'socket', function ($scope, socket) {
    $scope.connecting = false;

    $scope.connect = function () {
        $scope.connecting = true;
    };

    socket.on('send:name', function (data) {
        alert(data.name);
    });
}]);
