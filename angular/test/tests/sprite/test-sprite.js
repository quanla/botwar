"use strict";

(function () {

    angular.module('bw.test.sprite', [
        'bw.sprite.editor',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('sprite', {
                    url: '/sprite',
                    templateUrl: "tests/sprite/test-sprite.html",
                    controller: "bw.test.sprite.Ctrl"
                })
            ;
        }])


        .controller("bw.test.sprite.Ctrl", function($scope, $http) {
            //$scope.unitType = "footman";
            $scope.unitType = "archer";

            $scope.showSpriteSheet = function(unit, gridMode) {
                var jsonUrl = "../../assets/sprites/" + unit + ".json";
                $http.get(jsonUrl).success(function(data) {
                    var imageUrl = jsonUrl.replace(/\w+\.json$/, '') + data.meta.image;
                    $scope.showSpriteSheetEditor({
                        imageUrl: imageUrl,
                        data: data,
                        gridMode: gridMode,
                        onChange: function() {
                            $scope.saveSpriteSheet();
                        }
                    });

                    $scope.saveSpriteSheet = function() {
                        $http.post(jsonUrl, data);
                    };
                });
            };

            $scope.setUnitType = function(ut) {
                $scope.unitType = ut;
            };

            $scope.showStand = function(unit) {

                function create(position, direction, state, num) {
                    return {
                        type: unit,
                        position: position,
                        direction: direction,
                        state: {
                            name: state,
                            freezeNum: num
                        },
                        decor: "circle"
                    };
                }

                var units = [];

                function createCol(row, state, num) {
                    for (var i = 0; i < 5; i++) {
                        units.push(create({x: 60 * row, y: 40 + i * 70}, i * Math.PI/4, state, num));
                    }
                }

                var a=1;
                createCol(a++, "stand", null);
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
                $scope.color = "red";

                $scope.showGame({
                    sides: [
                        {
                            color: $scope.color,
                            units: units
                        }
                    ]
                });
            };

            //$scope.showSpriteSheet($scope.unitType, true);
            $scope.showSpriteSheet($scope.unitType, false);

        })
    ;

})();