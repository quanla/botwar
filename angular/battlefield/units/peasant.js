"use strict";

(function () {

    angular.module('bw.battlefield.units.peasant', [
        'bw.battlefield.renderer.unit.land-unit',
        'bw.battlefield.unit-dynamics'
    ])
        .config(function(GameSetupProvider, UnitRenderProvider, UnitFightingStyleProvider, UnitPhysicsProvider, UnitImpactProvider) {
            GameSetupProvider.addUnitType("peasant", {
                defaultHitpoint: 50
            });

            UnitFightingStyleProvider.addStyle("peasant", {
                createHitImpact: 10 * 4,
                fightFinish: 10 * 5,
                damage: 7
            });

            UnitPhysicsProvider.addUnitType("peasant", {
                needWay: true,
                maxSpeed: 1
            });

            UnitImpactProvider.addUnitType("peasant", {
                takeHit: true
            });

            UnitRenderProvider.addType("peasant", function(assetsLoc, LandUnitRender) {
                    return LandUnitRender.createLandUnitRender("peasant", "blue", {
                        steps: [0,1,2,3,4]
                    }, assetsLoc);
                }
            );
        })
    ;

})();