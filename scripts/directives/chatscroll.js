'use strict';

angular.module('mafiaApp').directive('chatScroll', function () {
    return {
        scope: {
            chatScroll: "="
        },
        link: function ($scope, element) {
            $scope.$watchCollection('chatScroll', function (newValue) {
                if (newValue) {
                    element[0].scrollTop = element[0].scrollHeight;
                }
            });
        }
    };
});
