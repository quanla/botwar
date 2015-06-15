"use strict";

(function () {

    angular.module('bw.battlefield.game', [
        'bw.battlefield.unit-fighting-style',
        'bw.battlefield.unit-dynamics',
        'bw.battlefield.game.bot'
    ])
        .provider("GameSetup", function() {
            var types = {};

            this.addUnitType = function(unitType, setup) {
                types[unitType] = setup;
            };

            this.$get = function() {

                return {
                    getDefaultHitpoint : function(unitType) {
                        return types[unitType].defaultHitpoint;
                    }
                };
            };
        })

        .factory("GameRunner", function(BotRunner, UnitDynamics, GameUtil, UnitUtil, GameSetup) {

            return {
                newGameRunner: function(game, options) {
                    initGame(game, GameSetup);

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

                    var sc = speedControl();
                    if (options != null) {
                        sc.consume(options.consume);
                        sc.pause(options.pause);
                    }

                    var botRunner = BotRunner.createBotRunner(game);
                    sc.setAction(function(round) {
                        // Decide to move, change state
                        botRunner.runBots(round);

                        // Change velocity, position
                        // action impacts
                        UnitDynamics.applyDynamics(game, round);

                        // Invoke listeners
                        if (game.afterRoundDynamics) {
                            game.afterRoundDynamics(round);
                        }

                        // Check battle finished
                        updateGameState(game, round);
                    });
                    sc.eachRound(function(round) {
                        gameRunner.updateUI(round);
                    });

                    var gameRunner;
                    return gameRunner = {
                        updateUI: null,
                        onEachRound: function() {
                            sc.run();
                        },
                        consume: function(consume1) {
                            sc.consume(consume1);
                        },
                        pause: function(pause1) {
                            sc.pause(pause1);
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
                },
                getEnemies: function(unit) {
                    var total = [];
                    for (var i = 0; i < unit.side.enemies.length; i++) {
                        var enemySide = unit.side.enemies[i];
                        Cols.addAll(enemySide.units, total);
                    }
                    return total;
                }
            };
        })

    ;

    function initGame(game, GameSetup) {
        // Fill missing values
        if (game.nature == null) {
            game.nature = [];
        }

        game.finish = function() {
            if (game.isFinished) return;

            game.isFinished = true;
            if (game.onFinish) {
                game.onFinish();
            }
        };

        // Init sides
        for (var i = 0; i < game.sides.length; i++) {
            var side = game.sides[i];

            var enemies = [];
            for (var j = 0; j < game.sides.length; j++) {
                if (i == j) continue;
                var otherSide = game.sides[j];
                enemies.push(otherSide);
            }
            side.enemies = enemies;
        }


        // Init units
        for (var i = 0; i < game.sides.length; i++) {
            var side = game.sides[i];
            for (var j = 0; j < side.units.length; j++) {
                var unit = side.units[j];
                if (unit.hitpoint == null) {
                    unit.hitpoint = GameSetup.getDefaultHitpoint(unit.type);
                }
                unit.side = side;
            }
        }
    }

    function speedControl() {

        var pause = false;
        var multiply = 1;

        var round = -1;

        var action;
        var eachRound;

        function speedCheck() {
            var lastRound = null;
            var lastRoundTime = null;

            var roundDuration = 10;
            return {
                expectedRound: function() {
                    if (lastRound == null) {
                        return null;
                    }

                    var time = new Date().getTime();

                    return lastRound + Math.floor((time - lastRoundTime) / roundDuration * multiply);
                },
                remember: function(round) {
                    lastRound = round;
                    lastRoundTime = new Date().getTime();
                },
                clear: function() {
                    lastRound = null;
                    lastRoundTime = null;
                }
            };
        }
        var speedChecker = speedCheck();

        return {
            setAction: function(action1) {
                action = action1;
            },
            eachRound: function(eachRound1) {
                eachRound = eachRound1;
            },
            run: function() {
                if (pause) {
                    eachRound(round);
                    speedChecker.clear();
                } else {

                    var expectedRound = speedChecker.expectedRound() || round+1;
                    for (; round < expectedRound;) {
                        round++;
                        action(round);

                        if (round == expectedRound) {
                            speedChecker.remember(round);
                        }
                    }

                    eachRound(round);

                }
            },
            consume: function(consume1) {
                multiply = consume1 || 1;
            },
            pause: function(pause1) {
                pause = pause1;
            }
        };
    }
})();