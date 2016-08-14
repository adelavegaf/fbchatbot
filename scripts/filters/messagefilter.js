angular.module('mafiaApp').filter('messageFilter', [function () {
    return function (input, aliases) {
        if (typeof aliases !== 'object') {
            return input;
        }

        var out = [];

        angular.forEach(input, function (msg) {
            if (aliases[msg.alias]) {
                out.push(msg);
            }
        });
        return out;
    };
}]);
