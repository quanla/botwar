"use strict";

(function () {

    angular.module('bw.challenge.win-conditions', [
    ])
        .factory("WinConditions", function(UnitUtil) {

            var types = {
                "lastManStand": {
                    display: "Last man stand",
                    wouldApply: function(battleSetup) {
                        return !battleSetup.continuous;
                    },
                    compile: function(cond, side, battleSetup) {
                        if (battleSetup.continuous) {
                            return null;
                        }
                        return function() {
                            return Cols.find(side.units, UnitUtil.alive) != null && Cols.find(side.enemies, function(enemySide) { return Cols.find(enemySide.units, UnitUtil.alive) != null; }) == null;
                        };
                    }
                }
            };

            return {
                getName: function(cond) {
                    return types[cond.name].display;
                },
                wouldApply: function(cond, battleSetup) {
                    return types[cond.name].wouldApply(battleSetup);
                },
                compileWinningCondition: function(cond, side, battleSetup) {
                    return types[cond.name].compile(cond, side, battleSetup);
                }
            };
        })
    ;

})();