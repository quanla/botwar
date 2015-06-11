"use strict";

(function () {

    angular.module('bw.battlefield.unit-fighting-style', [
    ])
        .provider("UnitFightingStyle", function() {
            var styles = {};
            this.addStyle = function(unitType, fightingStyle) {
                styles[unitType] = fightingStyle;
            };

            this.$get = function () {
                return {
                    getUnitFightingStyle: function(unit) {
                        return styles[unit.type];
                    }
                };
            };
        })
    ;

})();