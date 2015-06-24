"use strict";

(function () {

    angular.module('bw.battlefield.game', [
        'bw.battlefield.unit-fighting-style',
        'bw.battlefield.unit-dynamics',
        'bw.battlefield.game.bot-source',
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
                newGameRunner: function(game, options, uiSupport) {
                    var isErrored = false;

                    initGame(game, GameSetup);

                    function updateGameState(round, game) {
                        if (game.finished) return;

                        var result = checkGameFinished(round, game);
                        if (result) {
                            game.finish();
                        }
                    }

                    function checkGameFinished(round, game) {
                        for (var i = 0; i < game.sides.length; i++) {
                            var side = game.sides[i];

                            if (!side.won && !side.lost && side.checkLose) {
                                var checkLose = side.checkLose(round);
                                if (checkLose) {
                                    side.lost = checkLose;
                                }
                            }
                        }

                        for (var i = 0; i < game.sides.length; i++) {
                            var side = game.sides[i];

                            if (!side.won && !side.lost && side.checkWin) {
                                if (side.checkWin(round)) {
                                    side.won = true;
                                    return true;
                                }
                            }

                            if (Cols.isNotEmpty(side.enemies)) {
                                if (Cols.find(side.enemies, function(enemySide) { return enemySide.lost == null; }) == null) {
                                    side.won = true;
                                    return true;
                                }
                            }
                        }
                        return false;
                    }

                    var sc = speedControl();
                    if (options != null) {
                        sc.consume(options.consume);
                        sc.pause(options.pause);
                    }

                    var botRunner = BotRunner.createBotRunner(game);
                    sc.setAction(function(round) {
                        if (round > -1 && !game.started) {
                            game.started = true;
                        }

                        if (isErrored) return;

                        // Decide to move, change state
                        if (botRunner.runBots(round)) {
                            isErrored = true;
                        }

                        // Change velocity, position
                        // action impacts
                        UnitDynamics.applyDynamics(game, round, uiSupport);

                        // Invoke listeners
                        if (game.afterRoundDynamics) {
                            game.afterRoundDynamics(round);
                        }

                        // Check battle finished
                        updateGameState(round, game);
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
                                return unit;
                            }
                        }
                    }
                    for (var j = 0; j < game.nature.length; j++) {
                        var unit = game.nature[j];

                        if (func(unit)) {
                            return unit;
                        }
                    }
                    return null;
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
        game.started = false;

        // Fill missing values
        if (game.nature == null) {
            game.nature = [];
        }

        game.finish = function() {
            if (game.finished) return;

            game.finished = true;

            Fs.invokeAll(game.onFinishes);
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
                if (unit.state == null) {
                    unit.state = {name: "stand"};
                }
                unit.side = side;
                unit.birth = 0;
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

                    var plus = Math.min(100, Math.floor((time - lastRoundTime) / roundDuration * multiply));
                    return lastRound + plus;
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