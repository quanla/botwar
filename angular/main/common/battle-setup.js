"use strict";

(function () {

    angular.module('bw.main.battle-setup', [
    ])

        .factory("BattleSetup", function(PositionGenerator, BotSource) {
            return {
                createGame: function(battleSetup, prepareBot) {

                    var sides = [];

                    function addSide(sideNum, side) {
                        var units = [];
                        var positions = PositionGenerator.generatePositions(sideNum, side.units, battleSetup.width || 500, battleSetup.height || 500);
                        for (var j = 0; j < side.units.length; j++) {
                            var unitConfig = side.units[j];
                            for (var k = 0; k < unitConfig.count; k++) {
                                var botCode = !prepareBot ? null : side.bot != null ? side.bot.code : null;
                                var bot = botCode ? BotSource.createBot(botCode, unitConfig.type) : null;
                                units.push({
                                    type: unitConfig.type,
                                    position: positions(unitConfig.type),
                                    direction: sideNum * Math.PI + Math.PI / 2,
                                    bot: bot,
                                    state: {name: "stand"},
                                    afterBotRun: unitConfig.afterBotRun
                                });
                            }
                        }
                        sides.push({
                            color: sideNum == 0 ? "blue" : "red",
                            units: units
                        });
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
                            ContinuousSupport.checkEachRound(game, battleSetup, round, BotSource);
                        };
                    }
                    game.onFinish = battleSetup.onFinish;

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

            function getFreePoint(side) {

                var p;

                LOOP:
                for (;;) {
                    var x = Math.round(Math.random() * 100) + (side.color == "blue" ? 0 : battleSetup.width - 100);
                    var y = Math.round(Math.random() * battleSetup.height);
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

            function addUnit(side, type, bot) {
                var p = getFreePoint(side);

                var unit = {
                    position: {x: p.x, y: p.y},
                    type: type,
                    hitpoint: 100,
                    bot: BotSource.createBot(bot.code, type),
                    side: side,
                    state: {name: "stand"},
                    birth: round
                };
                side.units.push(unit);
            }

            for (var i = 0; i < game.sides.length; i++) {
                var side = game.sides[i];

                var sideSetup = getSideSetup(side.color);
                //console.log(sideSetup.bot);
                for (var j = 0; j < sideSetup.units.length; j++) {
                    var unitSetup = sideSetup.units[j];

                    // (unit.state == null || unit.state.name != "die") &&
                    var count = Cols.sum(side.units, function(unit) { return unit.type == unitSetup.type ? 1 : 0;});
                    if (count < unitSetup.count) {
                        //console.log(side.units.length);
                        for (var k = 0; k < unitSetup.count - count; k++) {
                            addUnit(side, unitSetup.type, sideSetup.bot);
                        }
                    }
                }
            }
        }
    };


})();