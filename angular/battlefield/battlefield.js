"use strict";

(function () {

    angular.module('bw.battlefield', [
        'bw.battlefield.game',
        'bw.battlefield.all-units',
        'bw.battlefield.renderer'
    ])

        .directive("battlefield", function(Renderers, GameRunner, UnitSprites) {
            return {
                restrict: "A",
                scope: {
                    game: "=battlefield",
                    options: "="
                },
                link: function($scope, elem, attrs) {

                    UnitSprites.init();

                    var renderer = Renderers.createRenderer(elem[0], attrs.width, attrs.height);

                    renderer.load(function() {
                        var unitSprites;
                        var gameRunner;

                        $scope.$applyAsync(function () {
                            $scope.$watch("game", function(game) {

                                if (unitSprites != null) {
                                    unitSprites.release();
                                    unitSprites = null;
                                }

                                if (game != null) {
                                    gameRunner = GameRunner.newGameRunner(game, $scope.options, attrs.width - 60, attrs.height - 60);

                                    unitSprites = UnitSprites.createUnitSprites(game, renderer.unitStage);

                                    gameRunner.updateUI = unitSprites.updateSprites;
                                    renderer.onEachRound(gameRunner.onEachRound);
                                } else {
                                    renderer.onEachRound(null);
                                }

                            });

                            $scope.$watch("options.consume", function(consume) {
                                if (gameRunner) gameRunner.consume(consume);
                            });
                            $scope.$watch("options.pause", function(pause) {
                                if (gameRunner) gameRunner.pause(pause);
                            })
                        });
                    });

                    $scope.$on("$destroy", function() {
                        renderer.destroy();
                    });
                }
            };
        })


    ;

})();