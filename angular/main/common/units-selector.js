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
                        if (unit.count >= (unit.type == "knight" ? 4 : 5)) return;
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