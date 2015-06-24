"use strict";

(function () {

    angular.module('bw.battlefield.units.ballista', [
        'bw.battlefield.renderer.unit.land-unit',
        'bw.battlefield.unit-dynamics'
    ])

        .config(function(GameSetupProvider, UnitRenderProvider, UnitFightingStyleProvider, UnitPhysicsProvider, UnitImpactProvider) {
            GameSetupProvider.addUnitType("ballista", {
                defaultHitpoint: 100
            });

            UnitFightingStyleProvider.addStyle("ballista", {
                fightFinish: 10 * 14,
                launch: {at: 10 * 7, type: "ballista_missile", range: 350},
                damage: 60
            });

            UnitPhysicsProvider.addUnitType("ballista", {
                bounded: true,
                needWay: true,
                maxSpeed: 0.6
            });

            UnitImpactProvider.addUnitType("ballista", {
                takeHit: true
            });

            UnitRenderProvider.addType("ballista", function(assetsLoc, LandUnitRender) {
                return LandUnitRender.createLandUnitRender("ballista", "blue", {
                    steps: [0,0,0,0,0,0,0,1,1,1,1,1,1,1]
                }, assetsLoc);
            });
        })

    ;

})();