"use strict";

(function () {

    angular.module('bw.test.color', [
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('color', {
                    url: '/color',
                    templateUrl: "tests/color/test-color.html",
                    controller: "bw.test.color.Ctrl"
                })
            ;
        }])


        .controller("bw.test.color.Ctrl", function($scope) {
            $scope.showStand = function() {

                function create(unit, position, direction, state, num) {
                    return {
                        type: unit,
                        position: position,
                        direction: direction,
                        state: {
                            name: state,
                            freezeNum: num
                        }
                    };
                }

                var units = [];

                function createCol(row, unit, state, num) {
                    for (var i = 0; i < 5; i++) {
                        units.push(create(unit, {x: 60 * row, y: 40 + i * 70}, i * Math.PI/4, state, num));
                    }
                }

                var a=1;
                createCol(a++, "footman", "stand", 0);
                createCol(a++, "archer", "stand", 0);
                //createCol(a++, "walk", 0);
                //createCol(a++, "walk", 1);
                //createCol(a++, "walk", 2);
                //createCol(a++, "walk", 3);
                //createCol(a++, "fight", 0);
                //createCol(a++, "fight", 1);
                //if (unit == "footman") {
                //    createCol(a++, "fight", 2);
                //    createCol(a++, "fight", 3);
                //}
                //createCol(a++, "die", 0);
                //createCol(a++, "die", 1);
                //createCol(a++, "die", 2);

                //$scope.color = "blue";
                //$scope.color = "red";

                $scope.showGame({
                    sides: [
                        {
                            color: $scope.color,
                            units: units
                        }
                    ]
                });
            };

            $scope.setColor = function(color) {
                $scope.color = color;
                $scope.showStand();
            };

            $scope.color = "white";
            $scope.showStand();
        })
    ;

})();