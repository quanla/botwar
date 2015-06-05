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
                    $scope.spriteSheet = {
                        imageUrl: imageUrl,
                        data: data,
                        gridMode: gridMode,
                        onChange: function() {
                            $scope.saveSpriteSheet();
                        }
                    };

                    $scope.saveSpriteSheet = function() {
                        $http.post(jsonUrl, data);
                    };
                });
            };

            $scope.setUnitType = function(ut) {
                $scope.unitType = ut;
                $scope.showSpriteSheet($scope.unitType, true);
            };

            //$scope.showSpriteSheet($scope.unitType, true);
            $scope.showSpriteSheet($scope.unitType, false);

        })
    ;

})();