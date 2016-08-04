'use strict';

angular.module('mafiaApp').controller('WebAppController', ['$scope', function ($scope) {
    $scope.page = 1;

    $scope.nextPage = function () {
        if ($scope.page < 3) {
            $scope.page++;
        }
    };

    $scope.prevPage = function () {
        if ($scope.page > 0) {
            $scope.page--;
        }
    };

    $scope.showFirstPage = function () {
        return $scope.page === 1;
    };

    $scope.showSecondPage = function () {
        return $scope.page === 2;
    };

    $scope.showThirdPage = function () {
        return $scope.page === 3;
    };
}]);
