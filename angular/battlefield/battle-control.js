"use strict";

(function () {

    angular.module('bw.battlefield.control', [
    ])
        .directive("battleControl", function() {
            return {
                restrict: "E",
                scope: {
                    game: "=",
                    start: "&",
                    options: "="
                },
                templateUrl: "angular/battlefield/battle-control.html",
                link: function($scope, elem, attrs) {
                    $scope.hasStart = attrs.start != null;
                }
            };
        })
    ;

})();