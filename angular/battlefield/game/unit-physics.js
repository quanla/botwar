"use strict";

(function () {

    angular.module('bw.battlefield.unit-physics', [
    ])
        .factory("UnitPhysics", function() {
            var landNormal = {
                needWay: true
            };
            var dirt = {
                needWay: false
            };
            return {
                getUnitPhysics: function(unit) {
                    if (unit.type == "footman" || unit.type == "archer") {
                        if (unit.state == null || unit.state.name != "die") {
                            return landNormal;
                        } else {
                            return dirt;
                        }
                    }
                    return dirt;
                }
            };
        })
    ;

})();