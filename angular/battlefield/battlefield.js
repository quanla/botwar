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


                    var unitSprites;
                    var gameRunner;

                    var renderer;
                    $scope.$watch("game", function(game) {

                        if (renderer) {
                            renderer.destroy();
                            elem[0].removeChild(renderer.view);
                            renderer = null;
                        }

                        if (unitSprites != null) {
                            unitSprites.release();
                            unitSprites = null;
                        }

                        if (game != null) {


                            renderer = Renderers.createRenderer(game.battlefield.width + 60, game.battlefield.height + 60);

                            elem[0].appendChild(renderer.view);

                            gameRunner = GameRunner.newGameRunner(game, $scope.options);

                            unitSprites = UnitSprites.createUnitSprites(game, renderer.unitStage, renderer.dirtStage);

                            gameRunner.updateUI = unitSprites.updateSprites;
                            renderer.onEachRound(gameRunner.onEachRound);
                        }

                    });

                    $scope.$watch("options.consume", function(consume) {
                        if (gameRunner) gameRunner.consume(consume);
                    });
                    $scope.$watch("options.pause", function(pause) {
                        if (gameRunner) gameRunner.pause(pause);
                    });

                    $scope.$on("$destroy", function() {
                        if (renderer) renderer.destroy();
                    });
                }
            };
        })


    ;

})();