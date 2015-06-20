"use strict";

(function () {

    angular.module('bw.battlefield.units.knight', [
        'bw.battlefield.renderer.unit.land-unit',
        'bw.battlefield.unit-dynamics'
    ])

        .config(function(GameSetupProvider, UnitRenderProvider, UnitFightingStyleProvider, UnitPhysicsProvider, UnitImpactProvider) {
            GameSetupProvider.addUnitType("knight", {
                defaultHitpoint: 130
            });

            UnitFightingStyleProvider.addStyle("knight", {
                createHitImpact: 10 * 3,
                fightFinish: 10 * 4,
                damage: 25
            });

            UnitPhysicsProvider.addUnitType("knight", {
                needWay: true,
                maxSpeed: 1.7
            });

            UnitImpactProvider.addUnitType("knight", {
                takeHit: true
            });

            UnitRenderProvider.addType("knight", function(assetsLoc, LandUnitRender) {
                return LandUnitRender.createLandUnitRender("knight", "blue", {
                    steps: [0,1,2,3]
                }, assetsLoc);
            });
        })

    ;

})();