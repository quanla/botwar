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


        .controller("bw.test.sprite.Ctrl", function($scope, $http, SpriteSheetEditors, testTypes) {
            //$scope.unitType = "footman";
            $scope.spriteNames = [
                ["footman", "footman"],
                ["knight", "knight"],
                ["zerling", "zerling_move"]
            ];

            $scope.view = {
                spriteName: $scope.spriteNames[1]
                //unitType: "peasant"
            };

            $scope.sse = SpriteSheetEditors.createSpriteSheetEditor();
            $scope.spriteSheet = {
                imageUrl: null,
                data: null
            };

            $scope.showSpriteSheet = function(folder, spriteName) {
                var jsonUrl  = "../../assets/sprites/" + folder + "/" + spriteName + ".json";
                var imageUrl = "../../assets/sprites/" + folder + "/" + spriteName + ".png";

                $scope.sse.setImageUrl(imageUrl);
                $scope.sse.setGrid(null);

                $http.get(jsonUrl)
                    .success(function(data) {
                        $scope.sse.setGrid(getGrid(data));
                    })
                ;
                $scope.saveSpriteSheet = function() {
                    $http.post(jsonUrl, createData());
                };
            };

            $scope.$watch("view.spriteName", function(spriteName) {
                $scope.showSpriteSheet(spriteName[0], spriteName[1]);
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
                for (var i = 0; i < cols + 1; i++) {
                    xs.push(Math.round(width / cols * i));
                }

                var height = $scope.sse.getSpriteSheetHeight();
                var ys = [];
                for (var i = 0; i < rows + 1; i++) {
                    ys.push(Math.round(height / rows * i));
                }

                $scope.sse.setGrid({
                    xs: xs,
                    ys: ys
                });

                $scope.lineNames = [];
                for (var i = 0; i < rows; i++) {
                    $scope.lineNames.push("");
                }
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

            function createData() {

                var frames = {};

                var grid = $scope.sse.grid;
                //$scope.lineNames
                var unitType = $scope.view.spriteName[0];
                for (var i = 0; i < grid.ys.length - 1; i++) {
                    var y = grid.ys[i];
                    var h = grid.ys[i + 1] - y;

                    h = Math.floor(h / 2) * 2;

                    var lineName = $scope.lineNames[i];
                    for (var j = 0; j < grid.xs.length - 1; j++) {
                        var x = grid.xs[j];
                        var w = grid.xs[j + 1] - x;

                        w = Math.floor(w / 2) * 2;

                        var frame = {x:x,y:y,w:w,h:h};
                        var name = unitType + "_" + lineName + "_" + j + ".png";

                        frames[name] = {
                            frame: frame,
                            trimmed: false
                        };
                    }
                }

                return {
                    frames: frames,
                    "meta":{"image": $scope.view.spriteName[1] + ".png"}
                };
            };
        })
    ;

})();