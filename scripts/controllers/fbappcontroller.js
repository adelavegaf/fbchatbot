'use strict';

angular.module('mafiaApp').controller('FbAppController', ['$scope', function ($scope) {
    $scope.page = 1;

    $scope.nextPage = function () {
        $scope.page = 2;
    };

    $scope.prevPage = function () {
        $scope.page = 1;
    };

    $scope.showFirstPage = function () {
        return $scope.page === 1;
    };

    $scope.showLastPage = function () {
        return $scope.page === 2;
    };
}]);
