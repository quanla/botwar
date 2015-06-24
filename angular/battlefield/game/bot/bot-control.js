"use strict";

(function () {

    angular.module('bw.battlefield.game.bot.bot-control', [
    ])

        .factory("BotControl", function() {
            return {
                createBotControl: function(game) {

                    return {
                        createControl: function(unitPresHandle, round, traverse) {
                            var unit = unitPresHandle.o;

                            var selector = {
                                getNearestEnemy: function() {
                                    var enemies = traverse.getEnemies();
                                    if (Cols.isEmpty(enemies)) {
                                        return null;
                                    }
                                    return Cols.findMin(enemies, function(enemy) {
                                        return Distance.between(unit.position, enemy.position);
                                    });
                                },
                                getNearestFriend: function() {
                                    var friends = traverse.getFriends();
                                    if (Cols.isEmpty(friends)) {
                                        return null;
                                    }
                                    return Cols.findMin(friends, function(friend) {
                                        return Distance.between(unit.position, friend.position);
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

                            var communication = {
                                sendAll: function(unit, message) {
                                    traverse.eachFriend(unit, function(friendPres) {
                                        friendPres.sendMessage(message);
                                    });
                                },
                                sendTo: function(friendPres, message) {
                                    friendPres.sendMessage(message);
                                }
                            };


                            var botControl;
                            return botControl = {
                                round: round,
                                type: unit.type,
                                hitpoint: unit.hitpoint,
                                position: unitPresHandle.l.truth.position,
                                direction: unit.direction,
                                state: unitPresHandle.l.truth.state,

                                battlefield: {width: game.battlefield.width, height: game.battlefield.height},

                                turnToward: function(pos) {
                                    if (unit.state.name == "die") return; // This is the last run

                                    this.direction = Vectors.toVector( Vectors.subtractPos(pos, unit.position)).direction;
                                },
                                turnAway: function(pos) {
                                    if (unit.state.name == "die") return; // This is the last run

                                    this.direction = Vectors.toVector( Vectors.subtractPos(unit.position, pos)).direction;
                                },
                                goForward: function() {
                                    if (unit.state.name == "die") return; // This is the last run

                                    unit.botBlockedUtil = round + 10;
                                    if (unit.state.name == "walk") {
                                        return;
                                    }
                                    unit.state = {
                                        name: "walk",
                                        since: round
                                    };
                                    unit.moveAccel = 1;
                                },
                                fight: function() {
                                    if (unit.state.name == "die") return; // This is the last run

                                    unit.state = {
                                        name: "fight",
                                        since: round
                                    };
                                    unit.botBlockedUtil = round + 50;
                                    unit.moveAccel = 0;
                                },
                                stand: function() {
                                    if (unit.state.name == "die") return; // This is the last run

                                    unit.state = {name: "stand"};
                                    unit.botBlockedUtil = null;
                                    unit.moveAccel = 0;
                                },
                                // Deprecated
                                setDirection: function(pos) {
                                    this.turnToward(pos);
                                },

                                sendMessage: function(message, to) {
                                    if (to == null) {
                                        communication.sendAll(unit, message);
                                    } else {
                                        communication.sendTo(to, message);
                                    }
                                },
                                sendToAll: function(message) {
                                    communication.sendAll(unit, message);
                                },

                                getEnemies: traverse.getEnemies,
                                getNearestEnemy: selector.getNearestEnemy,
                                getNearestFriend: selector.getNearestFriend,
                                getFriends: function() {
                                    return traverse.getFriends(unit);
                                },
                                predictPosition: predict.predictPosition,

                                messages: unit.messages,
                                self: unitPresHandle.l.truth,
                                setFact: function(name, value) {
                                    if (unit.side.facts == null) {
                                        unit.side.facts = {};
                                    }
                                    unit.side.facts[name] = value;
                                },
                                getFact: function(name) {
                                    if (unit.side.facts == null) {
                                        return null;
                                    }
                                    return unit.side.facts[name];
                                }
                            }
                        }
                    };
                }
            };
        })

    ;

})();