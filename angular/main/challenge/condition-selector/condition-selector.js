"use strict";

(function () {

    angular.module('bw.main.challenge.condition-selector', [
        'bw.challenge.win-conditions'
    ])
        .directive("conditionSelector", function(WinConditions) {
            return {
                restrict: "E",
                templateUrl: "angular/main/challenge/condition-selector/condition-selector.html",
                scope: {
                    setup: "="
                },
                link: function($scope, elem, attrs) {
                    $scope.getName = WinConditions.getName;
                    $scope.wouldApply = function(cond) {
                        return WinConditions.wouldApply(cond, $scope.setup);
                    };

                    $scope.remove = function(cond) {
                        Cols.remove(cond, $scope.setup.winningConditions);
                    };
                }
            };
        })
    ;

})();