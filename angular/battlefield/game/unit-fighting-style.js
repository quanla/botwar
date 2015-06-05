"use strict";

(function () {

    angular.module('bw.battlefield.unit-fighting-style', [
    ])
        .factory("UnitFightingStyle", function(UnitRender) {
            var styles = {
                "footman": {
                    isHit: function (round, unit) {
                        return (round - unit.state.since) == UnitRender.aniSpeed * 3;
                    },
                    isFinished: function (round, unit) {
                        return (round - unit.state.since) == (UnitRender.aniSpeed * 4);
                    },
                    isCreateArrow: function (round, unit) {
                        return false;
                    }
                },
                "archer": {
                    isHit: function (round, unit) {
                        return false;
                    },
                    isFinished: function (round, unit) {
                        return (round - unit.state.since) == (UnitRender.aniSpeed * 4);
                    },
                    isCreateArrow: function (round, unit) {
                        return (round - unit.state.since) == UnitRender.aniSpeed * 3;
                    }
                }
            };
            return {
                getUnitFightingStyle: function(unit) {
                    return styles[unit.type];
                }
            };
        })
    ;

})();