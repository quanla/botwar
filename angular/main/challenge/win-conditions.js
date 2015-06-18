"use strict";

(function () {

    angular.module('bw.challenge.win-conditions', [
    ])
        .factory("WinConditions", function(UnitUtil) {

            var names = {
                "lastManStand": "Last man stand"
            };

            return {
                getName: function(name) {
                    return names[name];
                },
                compileWinningCondition: function(cond, side, battleSetup) {
                    if (cond.name == "lastManStand") {
                        if (battleSetup.continuous) {
                            return null;
                        }
                        return function() {
                            return Cols.find(side.units, UnitUtil.alive) != null && Cols.find(side.enemies, function(enemySide) { return Cols.find(enemySide.units, UnitUtil.alive) != null; }) == null;
                        };
                    }
                }
            };
        })
    ;

})();