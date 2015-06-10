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
            $scope.view = {
                unitType: "peasant"
            };

            $scope.spriteSheet = {
                imageUrl: null,
                data: null
            };

            $scope.showSpriteSheet = function(unit) {
                var jsonUrl  = "../../assets/sprites/" + unit + ".json";
                var imageUrl = "../../assets/sprites/" + unit + ".png";

                $scope.spriteSheet.imageUrl = imageUrl;
                $scope.spriteSheet.data = null;

                $http.get(jsonUrl)
                    .success(function(data) {
                        $scope.spriteSheet.data = data;
                    })
                ;

                $scope.saveSpriteSheet = function() {
                    $http.post(jsonUrl, $scope.spriteSheet.data);
                };
            };

            $scope.$watch("view.unitType", function(unitType) {
                $scope.showSpriteSheet(unitType);
            });

        })
    ;

})();