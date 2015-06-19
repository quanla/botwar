"use strict";

(function () {

    angular.module('bw.challenge.win-conditions', [
    ])
        .factory("WinConditions", function(UnitUtil) {

            var types = {
                "lastManStand": {
                    display: "Last man stand",
                    description: "Has the last soldier standing on the battlefield.",
                    wouldApply: function(battleSetup) {
                        return !battleSetup.continuous;
                    },
                    compileLosingCondition: function(cond, side) {
                        return function() {
                            return Cols.find(side.units, UnitUtil.alive) == null;
                        };
                    }
                },
                "hasMorePoints": {
                    display: "Has more points",
                    description: "Has more points than any enemies. Each point you have is a damage point an enemy taken from you",
                    params: [
                        {name: "after", display: "After", unit: "seconds"}
                    ],
                    compileWinningCondition: function(cond, side) {
                        return function(round) {
                            if (round < cond.after * 100) return false;
console.log(side.color);
console.log(side.score);
                            return Cols.find(side.enemies, function(enemySide) { return enemySide.score > side.score; }) == null;
                        };
                    }
                }
            };

            return {
                getName: function(cond) {
                    return types[cond.name].display;
                },
                getDescription: function(cond) {
                    return types[cond.name].description;
                },
                wouldApply: function(cond, battleSetup) {
                    var type = types[cond.name];
                    return type.wouldApply == null || type.wouldApply(battleSetup);
                },
                compileWinningCondition: function(cond, side, battleSetup) {
                    var type = types[cond.name];
                    if ((type.wouldApply != null && !type.wouldApply(battleSetup)) || type.compileWinningCondition == null) {
                        return null;
                    }
                    return type.compileWinningCondition(cond, side, battleSetup);
                },
                compileLosingCondition: function(cond, side, battleSetup) {
                    var type = types[cond.name];
                    if ((type.wouldApply != null && !type.wouldApply(battleSetup)) || type.compileLosingCondition == null) {
                        return null;
                    }
                    var checkLose = type.compileLosingCondition(cond, side, battleSetup);
                    return function(round) {
                        if (checkLose(round)) {
                            return cond;
                        }
                    };
                }
            };
        })
    ;

})();