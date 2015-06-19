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
                    compileLosingCondition: function(cond, side) {
                        return function() {
                            return Cols.find(side.units, UnitUtil.alive) == null;
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
                    var type = types[cond.name];
                    if (!type.wouldApply(battleSetup) || type.compileWinningCondition == null) {
                        return null;
                    }
                    return type.compileWinningCondition(cond, side, battleSetup);
                },
                compileLosingCondition: function(cond, side, battleSetup) {
                    var type = types[cond.name];
                    if (!type.wouldApply(battleSetup) || type.compileLosingCondition == null) {
                        return null;
                    }
                    var checkLose = type.compileLosingCondition(cond, side, battleSetup);
                    return function() {
                        if (checkLose()) {
                            return cond;
                        }
                    };
                }
            };
        })
    ;

})();