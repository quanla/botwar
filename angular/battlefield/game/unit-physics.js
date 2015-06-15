"use strict";

(function () {

    angular.module('bw.battlefield.unit-physics', [
    ])
        .provider("UnitPhysics", function() {
            var types = {};

            this.addUnitType = function(unitType, physics) {
                types[unitType] = physics;
            };

            var dirt = {
                needWay: false,
                maxSpeed: 1
            };

            this.$get = function() {
                return {
                    getUnitPhysics: function(unit) {
                        if (unit.state.name != "die") {
                            return types[unit.type];
                        } else {
                            return dirt;
                        }
                        return dirt;
                    }
                };
            };
        })
    ;

})();