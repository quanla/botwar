"use strict";

(function () {

    angular.module('bw.unit-selector', [

    ])

        .directive("unitsSelector", function() {
            return {
                restrict: "E",
                scope: {
                    "units": "="
                },
                templateUrl: "angular/main/common/units-selector.html",
                link: function($scope, elem, attrs) {

                    $scope.addUnit = function(unit) {
                        if (unit.count >= (unit.type == "knight" ? 4 : unit.type == "footman" ? 10  : unit.type == "ballista" ? 2 : 5)) return;
                        unit.count ++;
                    };

                    $scope.removeUnit = function(unit) {
                        if (unit.count <= 0) return;
                        unit.count --;
                    };

                }
            };
        })

    ;

})();