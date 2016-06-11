'use strict';

angular.module('mafiaApp').controller('HeaderController', ['$scope', function ($scope) {

    $scope.active = 'play';

    $scope.setActive = function (link) {
        $scope.active = link;
    };

    $scope.isActive = function (link) {
        return $scope.active === link;
    };
}]);
