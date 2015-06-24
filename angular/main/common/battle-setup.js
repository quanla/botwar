"use strict";

(function () {

    angular.module('bw.main.battle-setup', [
    ])

        .factory("BattleSetup", function(PositionGenerator, UnitUtil, BotSource, WinConditions, UnitPhysics) {
            function Unit(props) {
                ObjectUtil.copy(props, this);
            }
            Unit.prototype = {
                isBounded: function() {
                    return this.overwrite && this.overwrite.bounded != null ? this.overwrite.bounded : this.bounded;
                },
                isNeedWay: function() {
                    return this.overwrite && this.overwrite.needWay != null ? this.overwrite.needWay : this.needWay;
                },
                getBot: function() {
                    return this.overwrite && this.overwrite.bot != null ? this.overwrite.bot : this.bot;
                }
            };

            function createUnit(props) {
                var unit = new Unit(props);

                var unitPhysics = UnitPhysics.getUnitPhysics(unit.type);
                unit.bounded = unitPhysics.bounded;
                unit.needWay = unitPhysics.needWay;
                unit.maxSpeed = unitPhysics.maxSpeed;

                return unit;
            }

            return {
                createUnit: createUnit,
                createGame: function(battleSetup, prepareBot) {
                    if (battleSetup.winningConditions == null) {
                        battleSetup.winningConditions = [{name: "lastManStand"}];
                    }

                    var sides = [];

                    function addSide(sideNum, sideSetup) {
                        var units = [];

                        function addUnit(props) {
                            units.push(createUnit(props));
                        }

                        var positions = PositionGenerator.generatePositions(sideNum, sideSetup.units, battleSetup.width || 500, battleSetup.height || 500);
                        for (var j = 0; j < sideSetup.units.length; j++) {
                            var unitConfig = sideSetup.units[j];
                            for (var k = 0; k < unitConfig.count; k++) {
                                var botCode = !prepareBot ? null : sideSetup.bot != null ? sideSetup.bot.code : null;
                                var bot = botCode ? BotSource.createBot(botCode, unitConfig.type) : null;

                                var unitPhysics = UnitPhysics.getUnitPhysics(unitConfig.type);

                                addUnit({
                                    type: unitConfig.type,
                                    position: positions(unitConfig.type),
                                    direction: sideNum * Math.PI + Math.PI / 2,
                                    bot: bot,
                                    state: {name: "stand"},
                                    afterBotRun: unitConfig.afterBotRun
                                });
                            }
                        }

                        var side = {
                            color: sideNum == 0 ? "blue" : "red",
                            units: units,
                            score: 0,
                            addUnit: addUnit
                        };

                        function compileConditions(side, battleSetup, compile) {
                            var conditions = [];
                            for (var i = 0; i < battleSetup.winningConditions.length; i++) {
                                var cond = battleSetup.winningConditions[i];
                                var wcond = compile(cond, side, battleSetup);
                                if (wcond != null) conditions.push(wcond);
                            }

                            return conditions;
                        }
                        
                        var winningConditions = compileConditions(side, battleSetup, WinConditions.compileWinningCondition);
                        var losingConditions = compileConditions(side, battleSetup, WinConditions.compileLosingCondition);

                        side.checkWin = function(round) {
                            return Cols.isEmpty(winningConditions) ? false : Fs.and(winningConditions, round);
                        };
                        side.checkLose = function(round) {
                            return Cols.isEmpty(losingConditions) ? false : Fs.or(losingConditions, round);
                        };

                        sides.push(side);
                    }

                    addSide(0, battleSetup.sides[0]);
                    addSide(1, battleSetup.sides[1]);

                    var game = {
                        sides: sides,
                        battlefield: {
                            width: battleSetup.width, height: battleSetup.height
                        }
                    };

                    if (battleSetup.afterRoundDynamics) {
                        game.afterRoundDynamics = battleSetup.afterRoundDynamics;
                    } else if (battleSetup.continuous) {
                        game.continuous = battleSetup.continuous;
                        game.afterRoundDynamics = function(round) {
                            if (game.finished) return;
                            ContinuousSupport.checkEachRound(game, battleSetup, round, BotSource);
                        };
                    }
                    game.onFinishes = [];
                    if (battleSetup.onFinish) { game.onFinishes.push(battleSetup.onFinish); };


                    game.onFinishes.push(function() {
                        var winBot = {
                            run: function(control) {
                                control.stand();
                            }
                        };
                        for (var i = 0; i < game.sides.length; i++) {
                            var side = game.sides[i];

                            for (var j = 0; j < side.units.length; j++) {
                                var unit = side.units[j];
                                unit.overwrite = {
                                    bot: winBot
                                };
                            }
                        }
                    });

                    return game;
                }
            };
        })
    ;

    var ContinuousSupport = {
        checkEachRound : function(game, battleSetup, round, BotSource) {

            function getSideSetup(color) {
                return Cols.find(battleSetup.sides, function(side) { return side.color == color; });
            }

            function getFreePoint(forSide) {

                var p;

                LOOP:
                for (;;) {
                    var x = Math.round(Math.random() * 100) + (forSide.color == "blue" ? -130 : battleSetup.width + 30);
                    var y = Math.round(Math.random() * (battleSetup.height + 100)) - 50;
                    p = {x: x, y: y};

                    for (var i = 0; i < game.sides.length; i++) {
                        var side = game.sides[i];
                        for (var j = 0; j < side.units.length; j++) {
                            var unit = side.units[j];
                            if (unit.state.name != "die" ) {
                                if (Distance.between(unit.position, p) <= 40) {
                                    continue LOOP;
                                }
                            }
                        }

                    }
                    break;
                }

                return p;
            }

            var moveInBot = {
                run: function(control) {
                    control.turnToward({x: battleSetup.width/2, y: battleSetup.height/2});
                    control.goForward();
                }
            };

            function addUnit(side, type, bot) {
                var p = getFreePoint(side);

                var unit = {
                    position: {x: p.x, y: p.y},
                    type: type,
                    hitpoint: 100,
                    bot: BotSource.createBot(bot.code, type),
                    side: side,
                    state: {name: "stand"},
                    birth: round,
                    overwrite: {
                        bounded: false,
                        until: function() {
                            return this.position.x >= 0 && this.position.y >= 0 && this.position.x < battleSetup.width && this.position.y < battleSetup.height;
                        },
                        bot: moveInBot
                    }
                };
                side.addUnit(unit);
            }

            for (var i = 0; i < game.sides.length; i++) {
                var side = game.sides[i];

                var sideSetup = getSideSetup(side.color);
                //console.log(sideSetup.bot);
                for (var j = 0; j < sideSetup.units.length; j++) {
                    var unitSetup = sideSetup.units[j];

                    var count = Cols.sum(side.units, function(unit) { return unit.type == unitSetup.type && (unit.state.name != "die" || round - unit.state.since < 200 ) ? 1 : 0;});
                    if (count < unitSetup.count) {
                        for (var k = 0; k < unitSetup.count - count; k++) {
                            addUnit(side, unitSetup.type, sideSetup.bot);
                        }
                    }
                }
            }
        }
    };


})();