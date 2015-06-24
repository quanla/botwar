"use strict";

(function () {

    angular.module('bw.battlefield.units.grunt', [
        'bw.battlefield.renderer.unit.land-unit',
        'bw.battlefield.unit-dynamics'
    ])

        .config(function(GameSetupProvider, UnitRenderProvider, UnitFightingStyleProvider, UnitPhysicsProvider, UnitImpactProvider) {
            GameSetupProvider.addUnitType("grunt", {
                defaultHitpoint: 100
            });

            UnitFightingStyleProvider.addStyle("grunt", {
                createHitImpact: 10 * 3,
                fightFinish: 10 * 4,
                damage: 20
            });

            UnitPhysicsProvider.addUnitType("grunt", {
                bounded: true,
                needWay: true,
                maxSpeed: 1
            });

            UnitImpactProvider.addUnitType("grunt", {
                takeHit: true
            });

            UnitRenderProvider.addType("grunt", function(assetsLoc, LandUnitRender) {
                return LandUnitRender.createLandUnitRender("grunt", "red", {
                    steps: [0,1,2,3]
                }, assetsLoc);
            });
        })

    ;

})();