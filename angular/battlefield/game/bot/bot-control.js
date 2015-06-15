"use strict";

(function () {

    angular.module('bw.battlefield.game.bot.bot-control', [
    ])

        .factory("BotControl", function() {
            return {
                createControl: function(unit, round, traverse) {

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
                        getFriends: function() {
                            return traverse.getFriends(unit);
                        },
                        predictPosition: predict.predictPosition
                    }
                }
            };
        })

    ;

})();