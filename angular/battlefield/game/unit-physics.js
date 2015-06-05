"use strict";

(function () {

    angular.module('bw.battlefield.unit-physics', [
    ])
        .factory("UnitPhysics", function() {
            var landNormal = {
                needWay: true,
                maxSpeed: 1
            };
            var arrow = {
                needWay: false,
                maxSpeed: 20
            };
            var dirt = {
                needWay: false,
                maxSpeed: 1
            };
            return {
                getUnitPhysics: function(unit) {
                    if (unit.type == "footman" || unit.type == "archer") {
                        if (unit.state == null || unit.state.name != "die") {
                            return landNormal;
                        } else {
                            return dirt;
                        }
                    } else if (unit.type == "arrow") {
                        return arrow;
                    }
                    return dirt;
                }
            };
        })
    ;

})();