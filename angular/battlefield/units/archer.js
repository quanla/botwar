"use strict";

(function () {

    angular.module('bw.battlefield.units.archer', [
        'bw.battlefield.renderer.unit.land-unit',
        'bw.battlefield.unit-dynamics'
    ])
        .config(function(GameSetupProvider, UnitRenderProvider, UnitFightingStyleProvider, UnitPhysicsProvider, UnitImpactProvider) {
            GameSetupProvider.addUnitType("archer", {
                defaultHitpoint: 60
            });

            UnitFightingStyleProvider.addStyle("archer", {
                fightFinish: 10 * 4,
                launch: {at: 10 * 3, type: "arrow", range: 200},
                damage: 15
            });

            UnitPhysicsProvider.addUnitType("archer", {
                bounded: true,
                needWay: true,
                maxSpeed: 1
            });
            UnitImpactProvider.addUnitType("archer", {
                takeHit: true
            });

            UnitRenderProvider.addType("archer", function(assetsLoc, LandUnitRender) {
                return LandUnitRender.createLandUnitRender("archer", "blue", {
                    steps: [0,0,0,1]
                }, assetsLoc);
            });
        })
    ;

})();