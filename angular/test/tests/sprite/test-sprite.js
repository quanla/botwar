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


        .controller("bw.test.sprite.Ctrl", function($scope, $http, SpriteSheetEditors) {
            //$scope.unitType = "footman";
            $scope.view = {
                unitType: "footman"
                //unitType: "peasant"
            };

            $scope.sse = SpriteSheetEditors.createSpriteSheetEditor();
            $scope.spriteSheet = {
                imageUrl: null,
                data: null
            };

            $scope.showSpriteSheet = function(unit) {
                var jsonUrl  = "../../assets/sprites/" + unit + ".json";
                var imageUrl = "../../assets/sprites/" + unit + ".png";

                $scope.sse.setImageUrl(imageUrl);
                $scope.sse.setGrid(null);

                $http.get(jsonUrl)
                    .success(function(data) {
                        $scope.sse.setGrid(getGrid(data));
                    })
                ;
            };

            $scope.$watch("view.unitType", function(unitType) {
                $scope.showSpriteSheet(unitType);
            });

            $scope.createSpriteSheet = function() {
                var cols = prompt("Cols?");
                if (cols==null) return;
                cols = cols*1;
                var rows = prompt("Rows?");
                if (rows==null) return;
                rows = rows*1;

                var width = $scope.sse.getSpriteSheetWidth();
                var xs = [];
                for (var i = 0; i < cols - 1; i++) {
                    xs.push(width / cols * (i+1));
                }

                var height = $scope.sse.getSpriteSheetHeight();
                var ys = [];
                for (var i = 0; i < rows - 1; i++) {
                    ys.push(height / rows * (i+1));
                }

                $scope.sse.setGrid({
                    xs: xs,
                    ys: ys
                });
            };

            function getGrid(data) {
                if (data == null) {
                    return null;
                }
                var xs = [];
                var ys = [];

                function addX(x) {
                    if (xs.indexOf(x) == -1) {
                        xs.push(x);
                    }
                }
                function addY(y) {
                    if (ys.indexOf(y) == -1) {
                        ys.push(y);
                    }
                }

                for (var name in data.frames) {
                    var frame = data.frames[name].frame;

                    addX(frame.x);
                    addX(frame.x + frame.w);
                    addY(frame.y);
                    addY(frame.y + frame.h);
                }

                xs.sort();
                ys.sort();

                return {
                    xs: xs,
                    ys: ys
                };
            }
        })
    ;

})();