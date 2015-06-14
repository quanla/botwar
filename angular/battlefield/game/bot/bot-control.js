"use strict";

(function () {

    angular.module('bw.battlefield.game.bot.bot-control', [
    ])

        .factory("BotControl", function(UnitUtil) {
            function info(unit) {
                return unit== null ? null : {
                    type: unit.type,
                    direction: unit.direction,
                    velocity: unit.velocity,
                    position: ObjectUtil.clone(unit.position),
                    state: ObjectUtil.clone(unit.state)
                };
            }
            function friendInfo(unit) {
                return unit== null ? null : info(unit);
            }
            return {
                createControl: function(unit, round, game) {

                    var traverse = {
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
                        }
                    };

                    var selector = {
                        getNearestEnemy: function() {
                            var enemies = traverse.getEnemies();
                            if (Cols.isEmpty(enemies)) {
                                return null;
                            }
                            return Cols.findMin(enemies, function(enemy) {
                                return Distance.between(unit.position, enemy.position);
                            });
                        }
                    };

                    var predict = {
                        predictPosition: function(unit, roundNum) {
                            if (unit.velocity==null) {
                                return ObjectUtil.clone(unit.position);
                            }
                            var vector = ObjectUtil.clone(unit.velocity);
                            vector.value *= roundNum;

                            return Vectors.addPos(unit.position, Vectors.vectorPos(vector));
                        }
                    };


                    var botControl;
                    return botControl = {
                        round: round,
                        hitpoint: unit.hitpoint,
                        position: ObjectUtil.clone(unit.position),
                        direction: unit.direction,
                        turnToward: function(pos) {
                            this.direction = Vectors.toVector( Vectors.subtractPos(pos, unit.position)).direction;
                        },
                        turnAway: function(pos) {
                            this.direction = Vectors.toVector( Vectors.subtractPos(unit.position, pos)).direction;
                        },
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
                            unit.botBlockedUtil = round + 50;
                            unit.moveAccel = 0;
                        },
                        stand: function() {
                            unit.state = null;
                            unit.botBlockedUtil = null;
                            unit.moveAccel = 0;
                        },
                        // Deprecated
                        setDirection: function(pos) {
                            this.turnToward(pos);
                        },

                        getEnemies: traverse.getEnemies,
                        getNearestEnemy: selector.getNearestEnemy,
                        getFriends: traverse.getFriends,
                        predictPosition: predict.predictPosition
                    }
                }
            };
        })

    ;

})();