"use strict";

(function () {

    angular.module('bw.battlefield.unit-physics', [
    ])
        .provider("UnitPhysics", function() {
            var types = {};

            this.addUnitType = function(unitType, physics) {
                types[unitType] = physics;
            };

            this.$get = function() {
                return {
                    getUnitPhysics: function(unitType) {
                        return types[unitType];
                    }
                };
            };
        })
    ;

})();