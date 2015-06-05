"use strict";

(function () {

    angular.module('bw.battlefield.game.bot', [
    ])

        .factory("UnitUtil", function() {
            return {
                alive: function(unit) {
                    return unit.state == null || unit.state.name != "die" ? unit : null;
                }
            };
        })

        .factory("BotControl", function(UnitUtil) {
            function info(unit) {
                return unit== null ? null : {
                    position: ObjectUtil.clone(unit.position),
                    state: ObjectUtil.clone(unit.state)
                };
            }
            function friendInfo(unit) {
                return unit== null ? null : info(unit);
            }
            return {
                createControl: function(unit, round, game) {
                    return {
                        round: round,
                        position: ObjectUtil.clone(unit.position),
                        direction: unit.direction,
                        goForward: function() {
                            unit.botBlockedUtil = round + 10;
                            if (unit.state != null && unit.state.name == "walk") {
                                return;
                            }
                            unit.state = {
                                name: "walk",
                                since: round
                            };
                            unit.moveAccel = 1;
                        },
                        fight: function() {
                            unit.state = {
                                name: "fight",
                                since: round
                            };
                            unit.botBlockedUtil = round + 10;
                            unit.moveAccel = 0;
                        },
                        stand: function() {
                            unit.state = null;
                            unit.botBlockedUtil = null;
                            unit.moveAccel = 0;
                        },
                        getEnemies: function() {
                            var total = [];
                            for (var i = 0; i < game.sides.length; i++) {
                                var side1 = game.sides[i];
                                if (side1 !== unit.side) {
                                    // Enemy side
                                    var alives = Cols.yield(side1.units, Fs.chain(UnitUtil.alive, info));
                                    Cols.addAll(alives, total);
                                }
                            }
                            return total;
                        },
                        getFriends: function() {
                            var notSelf = function (unit1) {
                                return unit1 == unit ? null : unit1;
                            };
                            return Cols.yield(unit.side.units, Fs.chain(notSelf, UnitUtil.alive, friendInfo));
                        },
                        setDirection: function(pos) {
                            this.direction = Vectors.toVector( Vectors.subtractPos(pos, unit.position)).direction;
                        }
                    }
                }
            };
        })

        .factory("BotRunner", function(BotControl) {
            function isLocked(unit, round) {
                if (unit.state != null) {
                    if (["fight", "die"].indexOf(unit.state.name) > -1) {
                        return true;
                    } else if (round < unit.botBlockedUtil) {
                        return true;
                    }
                }
                return false;
            }
            return {
                runBots: function(game, round) {
                    for (var i = 0; i < game.sides.length; i++) {
                        var side = game.sides[i];

                        for (var j = 0; j < side.units.length; j++) {
                            var unit = side.units[j];
                            if (unit.bot && !isLocked(unit, round)) {

                                var control = BotControl.createControl(unit, round, game);

                                unit.bot.run(control);

                                if (unit.afterBotRun) {
                                    unit.afterBotRun(unit);
                                }

                                unit.direction = control.direction;
                            }
                        }
                    }
                }
            };
        })

    ;

})();