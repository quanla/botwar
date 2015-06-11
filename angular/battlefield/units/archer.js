"use strict";

(function () {

    angular.module('bw.battlefield.units.archer', [
        'bw.battlefield.renderer.unit.land-unit',
        'bw.battlefield.unit-dynamics'
    ])
        .config(function(GameSetupProvider, UnitRenderProvider, UnitFightingStyleProvider, UnitPhysicsProvider, UnitImpactProvider) {
            GameSetupProvider.addUnitType("archer", {
                defaultHitpoint: 70
            });

            UnitFightingStyleProvider.addStyle("archer", {
                fightFinish: 10 * 4,
                launchCreateArrow: 10 * 3,
                damage: 15
            });

            UnitPhysicsProvider.addUnitType("archer", {
                needWay: true,
                maxSpeed: 1
            });
            UnitImpactProvider.addUnitType("archer", {
                takeHit: true
            });

            UnitRenderProvider.addType("archer", function(assetsLoc, LandUnitRender) {
                return LandUnitRender.createLandUnitRender("archer", {
                    steps: [0,0,0,1]
                }, assetsLoc);
            });
        })
    ;

})();