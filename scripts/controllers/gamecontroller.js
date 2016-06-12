'use strict';

angular.module('mafiaApp').controller('GameController', ['$scope', function ($scope) {
    $scope.connecting = false;

    $scope.connect = function () {
        $scope.connecting = true;
    };
}]);
