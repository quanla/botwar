"use strict";

(function () {

    angular.module('bw.battlefield.game', [
        'bw.battlefield.unit-physics',
        'bw.battlefield.unit-fighting-style',
        'bw.battlefield.unit-dynamics',
        'bw.battlefield.game.bot'
    ])
        .factory("GameRunner", function(BotRunner, UnitDynamics, GameUtil, UnitUtil) {
            function initGame(game, width, height) {
                // Fill missing values
                if (game.nature == null) {
                    game.nature = [];
                }

                if (game.battlefield == null) {
                    game.battlefield = {
                        width: width, height: height
                    };
                }

                game.finish = function() {
                    if (game.isFinished) return;

                    game.isFinished = true;
                    if (game.onFinish) {
                        game.onFinish();
                    }
                };

                for (var i = 0; i < game.sides.length; i++) {
                    var side = game.sides[i];
                    for (var j = 0; j < side.units.length; j++) {
                        var unit = side.units[j];
                        if (unit.hitpoint == null) {
                            unit.hitpoint = 100;
                        }
                        unit.side = side;
                    }
                }
            }

            return {
                newGameRunner: function(game, options, width, height) {
                    var skip = options == null || options.skip == null ? 0 : options.skip;
                    var consume = options == null || options.consume == null ? 1 : options.consume;
                    var pause = options == null || options.pause == null ? 0 : options.pause;

                    var skipped = 0;
                    var skipper = function() {
                        if (skip==0) return false;
                        if (skipped < skip) {
                            skipped++;
                            return true;
                        } else {
                            skipped = 0;
                        }
                        return false;
                    };

                    initGame(game, width, height);

                    function updateGameState(game, round) {
                        if (game.isFinished) return;

                        var result = isGameFinished(game);
                        if (result) {
                            game.finish();
                        }
                    }

                    function isGameFinished(game) {
                        var count = 0;
                        var winningSide;
                        for (var i = 0; i < game.sides.length; i++) {
                            var side = game.sides[i];
                            var hasAlive = Cols.find(side.units, UnitUtil.alive) != null;
                            if (hasAlive) {
                                winningSide = side;
                                count++;
                                if (count > 1) {
                                    return false;
                                }
                            }
                        }
                        return winningSide;
                    }

                    var round = 0;

                    var gameRunner;
                    return gameRunner = {
                        updateUI: null,
                        onEachRound: function() {
                            if (!skipper() && !pause) {
                                for (var i = 0; i < consume; i++) {
                                    // Decide to move, change state
                                    BotRunner.runBots(game, round);

                                    // Change velocity, position
                                    // action impacts
                                    UnitDynamics.applyDynamics(game, round);

                                    // Invoke listeners
                                    if (game.afterRoundDynamics) {
                                        game.afterRoundDynamics();
                                    }

                                    // Check battle finished
                                    updateGameState(game, round);

                                    round++;
                                }

                                // Sprite update
                                gameRunner.updateUI(round - 1);

                            } else {
                                // Sprite update
                                gameRunner.updateUI(round);
                            }
                        },
                        skip: function(skip1) {
                            skip = skip1;
                        },
                        consume: function(consume1) {
                            consume = consume1 || 1;
                        },
                        pause: function(pause1) {
                            pause = pause1;
                        }
                    };
                }
            };
        })

        .factory("GameUtil", function() {
            return {
                eachUnit: function(game, func) {
                    for (var i = 0; i < game.sides.length; i++) {
                        var side = game.sides[i];
                        for (var j = 0; j < side.units.length; j++) {
                            var unit = side.units[j];

                            if (func(unit)) {
                                return true;
                            }
                        }
                    }
                    for (var j = 0; j < game.nature.length; j++) {
                        var unit = game.nature[j];

                        if (func(unit)) {
                            return true;
                        }
                    }
                    return false;
                }
            };
        })

    ;

})();