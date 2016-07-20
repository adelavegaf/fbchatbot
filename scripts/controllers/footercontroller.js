'use strict';

angular.module('mafiaApp').controller('FooterController', ['$scope', function ($scope) {

    $scope.active = '';

    $scope.setActive = function (link) {
        $scope.active = link;
    };

    $scope.isActive = function (link) {
        return $scope.active === link;
    };

}]);
