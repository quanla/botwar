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


        .controller("bw.test.color.Ctrl", function($scope, testTypes) {

            $scope.testTypes = testTypes;

            $scope.view = {
                unitType: "footman"
            };

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
                createCol(a++, $scope.view.unitType, "stand", 0);
                createCol(a++, $scope.view.unitType, "walk", 0);
                createCol(a++, $scope.view.unitType, "walk", 1);
                createCol(a++, $scope.view.unitType, "walk", 2);
                createCol(a++, $scope.view.unitType, "walk", 3);
                createCol(a++, $scope.view.unitType, "fight", 0);
                createCol(a++, $scope.view.unitType, "fight", 1);
                if ($scope.view.unitType != "archer") {
                    createCol(a++, $scope.view.unitType, "fight", 2);
                    createCol(a++, $scope.view.unitType, "fight", 3);
                }
                createCol(a++, $scope.view.unitType, "die", 0);
                createCol(a++, $scope.view.unitType, "die", 1);
                createCol(a++, $scope.view.unitType, "die", 2);

                $scope.game = {
                    sides: [
                        {
                            color: $scope.color,
                            units: units
                        }
                    ]
                };
            };

            $scope.setColor = function(color) {
                $scope.color = color;
                $scope.showStand();
            };

            $scope.$watch("view.unitType", $scope.showStand);

            $scope.color = "white";
            $scope.showStand();
        })
    ;

})();