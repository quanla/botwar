"use strict";

(function () {

    angular.module('bw.battlefield.game.bot', [
        'bw.battlefield.game.bot.bot-control'
    ])

        .factory("UnitUtil", function() {
            return {
                alive: function(unit) {
                    return unit.state == null || unit.state.name != "die" ? unit : null;
                }
            };
        })

        .factory("BotRunner", function(BotControl, UnitUtil) {
            function isLocked(unit, round) {
                if (unit.state != null) {
                    if (["fight", "die"].indexOf(unit.state.name) > -1) {
                        return true;
                    }
                }

                if (round < unit.botBlockedUtil) {
                    return true;
                }
                return false;
            }

            function createTruth(side) {
                var enemyUnitControls = [];
                for (var i = 0; i < side.enemies.length; i++) {
                    var enemySide = side.enemies[i];
                    enemyUnitControls.push( new ColLink(enemySide.units,
                        function (unit) {
                            var truth = {
                                type: unit.type
                            };
                            return {
                                truth: truth,
                                sync: function() {
                                    truth.direction = unit.direction;
                                    truth.velocity = unit.velocity;
                                    truth.position = ObjectUtil.clone(unit.position);
                                    truth.state = ObjectUtil.clone(unit.state);
                                }
                            };
                        }
                    ) );
                }

                var friendsLink = new ColLink(side.units,
                    function (unit) {
                        var truth = {
                            type: unit.type
                        };
                        return {
                            truth: truth,
                            sync: function() {
                                truth.direction = unit.direction;
                                truth.velocity = unit.velocity;
                                truth.position = ObjectUtil.clone(unit.position);
                                truth.state = ObjectUtil.clone(unit.state);
                            }
                        };
                    }
                );

                return {
                    side: side,
                    sync: function() {
                        for (var i = 0; i < enemyUnitControls.length; i++) {
                            var enemyUnitControl = enemyUnitControls[i];
                            enemyUnitControl.sync();
                            for (var j = 0; j < enemyUnitControl.link.length; j++) {
                                var h = enemyUnitControl.link[j];
                                h.l.sync();
                            }
                        }
                        friendsLink.sync();
                        for (var j = 0; j < friendsLink.link.length; j++) {
                            var h = friendsLink.link[j];
                            h.l.sync();
                        }
                    },
                    getEnemies: function() {
                        var enemies = [];
                        for (var i = 0; i < enemyUnitControls.length; i++) {
                            var enemyUnitControl = enemyUnitControls[i];
                            for (var j = 0; j < enemyUnitControl.link.length; j++) {
                                var h = enemyUnitControl.link[j];
                                if (UnitUtil.alive(h.o)) {
                                    enemies.push(h.l.truth);
                                }
                            }
                        }
                        return enemies;
                    },
                    getFriends: function(unit) {
                        var friends = [];
                        for (var j = 0; j < friendsLink.link.length; j++) {
                            var h = friendsLink.link[j];
                            if (h.o != unit) {
                                friends.push(h.l.truth);
                            }
                        }
                        return friends;
                    }
                };
            }

            return {
                createBotRunner: function(game) {


                    var sideTruths = [];
                    for (var i = 0; i < game.sides.length; i++) {
                        var side = game.sides[i];

                        // Create side truth
                        sideTruths.push(createTruth(side));
                    }

                    return {
                        runBots: function(round) {
                            for (var i = 0; i < sideTruths.length; i++) {
                                var sideTruth = sideTruths[i];
                                sideTruth.sync();

                                for (var j = 0; j < sideTruth.side.units.length; j++) {
                                    var unit = sideTruth.side.units[j];
                                    if (unit.bot && !isLocked(unit, round)) {

                                        if (unit.bot.run == null) {
                                            throw "Wrong bot config: " + unit.bot + ", run function is missing";
                                        }
                                        var control = BotControl.createControl(unit, round, sideTruth);

                                        unit.bot.run(control);

                                        if (unit.afterBotRun) {
                                            unit.afterBotRun(unit);
                                        }

                                        if (Math.abs(control.direction - unit.direction) > Math.PI/30) {
                                            //console.log("Blocked");
                                            unit.botBlockedUtil = unit.botBlockedUtil == null ? round + 10 : Math.max(unit.botBlockedUtil, round + 10);
                                        }
                                        //Math.PI/30
                                        if (!isNaN(control.direction)) {
                                            unit.direction = control.direction;
                                        }
                                    }
                                }

                            }





                            //for (var i = 0; i < game.sides.length; i++) {
                            //    var side = game.sides[i];
                            //
                            //    for (var j = 0; j < side.units.length; j++) {
                            //        var unit = side.units[j];
                            //        if (unit.bot && !isLocked(unit, round)) {
                            //
                            //            if (unit.bot.run == null) {
                            //                throw "Wrong bot config: " + unit.bot + ", run function is missing";
                            //            }
                            //            var control = BotControl.createControl(unit, round, game);
                            //
                            //            unit.bot.run(control);
                            //
                            //            if (unit.afterBotRun) {
                            //                unit.afterBotRun(unit);
                            //            }
                            //
                            //            if (Math.abs(control.direction - unit.direction) > Math.PI/30) {
                            //                //console.log("Blocked");
                            //                unit.botBlockedUtil = unit.botBlockedUtil == null ? round + 10 : Math.max(unit.botBlockedUtil, round + 10);
                            //            }
                            //            //Math.PI/30
                            //            if (!isNaN(control.direction)) {
                            //                unit.direction = control.direction;
                            //            }
                            //        }
                            //    }
                            //}
                        }
                    };
                }
            }
        })

    ;

})();