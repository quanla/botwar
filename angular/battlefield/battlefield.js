"use strict";

(function () {

    angular.module('bw.battlefield', [
        'bw.battlefield.game',
        'bw.battlefield.all-units',
        'bw.battlefield.renderer'
    ])

        .directive("battlefield", function(Renderers, GameRunner, UnitSprites, GameControl) {
            return {
                restrict: "A",
                scope: {
                    game: "=battlefield",
                    options: "="
                },
                link: function($scope, elem, attrs) {

                    var unitSprites;
                    var gameRunner;

                    var renderer;

                    var scale = attrs.scale ? attrs.scale * 1 : null;
                    $scope.$watch("game", function(game) {

                        if (unitSprites != null) {
                            unitSprites.release();
                            unitSprites = null;
                        }

                        if (game != null) {
                            var rendererWidth = game.battlefield.width + 60;
                            var rendererHeight = game.battlefield.height + 60;
                            if (renderer == null || renderer.width != rendererWidth || renderer.height != rendererHeight) {
                                if (renderer) {
                                    renderer.destroy();
                                    elem[0].removeChild(renderer.view);
                                }

                                renderer = Renderers.createRenderer(rendererWidth, rendererHeight, scale);
                                elem[0].appendChild(renderer.view);
                            }

                            var gameControl = GameControl.createGameControl(game);
                            gameControl.setStage(renderer.controlStage);

                            gameRunner = GameRunner.newGameRunner(game, $scope.options);

                            unitSprites = UnitSprites.createUnitSprites(game, renderer.unitStage, renderer.dirtStage);

                            gameRunner.updateUI = unitSprites.updateSprites;
                            renderer.onEachRound(function() {
                                gameRunner.onEachRound();
                                gameControl.updateUI();
                            });
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

        .factory("GameControl", function() {
            return {
                createGameControl: function() {
                    return {
                        setStage: function(stage) {

                        },
                        updateUI: function(stage) {

                        }

                    };
                }
            };
        })
    ;

})();