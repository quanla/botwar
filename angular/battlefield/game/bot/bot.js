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

        .factory("BotRunner", function(BotControl) {
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
            return {
                runBots: function(game, round) {
                    for (var i = 0; i < game.sides.length; i++) {
                        var side = game.sides[i];

                        for (var j = 0; j < side.units.length; j++) {
                            var unit = side.units[j];
                            if (unit.bot && !isLocked(unit, round)) {

                                if (unit.bot.run == null) {
                                    throw "Wrong bot config: " + unit.bot + ", run function is missing";
                                }
                                var control = BotControl.createControl(unit, round, game);

                                unit.bot.run(control);

                                if (unit.afterBotRun) {
                                    unit.afterBotRun(unit);
                                }

                                if (Math.abs(control.direction - unit.direction) > Math.PI/30) {
                                    //console.log("Blocked");
                                    unit.botBlockedUtil = unit.botBlockedUtil == null ? round + 10 : Math.max(unit.botBlockedUtil, round + 10);
                                }
                                //Math.PI/30
                                unit.direction = control.direction;
                            }
                        }
                    }
                }
            };
        })

    ;

})();