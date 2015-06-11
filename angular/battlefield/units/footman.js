"use strict";

(function () {

    angular.module('bw.battlefield.units.footman', [
        'bw.battlefield.renderer.unit.land-unit',
        'bw.battlefield.unit-dynamics'
    ])

        .config(function(GameSetupProvider, UnitRenderProvider, UnitFightingStyleProvider, UnitPhysicsProvider, UnitImpactProvider) {
            GameSetupProvider.addUnitType("footman", {
                defaultHitpoint: 100
            });

            UnitFightingStyleProvider.addStyle("footman", {
                createHitImpact: 10 * 3,
                fightFinish: 10 * 4,
                damage: 20
            });

            UnitPhysicsProvider.addUnitType("footman", {
                needWay: true,
                maxSpeed: 1
            });

            UnitImpactProvider.addUnitType("footman", {
                takeHit: true
            });

            UnitRenderProvider.addType("footman", function(assetsLoc, LandUnitRender) {
                return LandUnitRender.createLandUnitRender("footman", {
                    steps: [0,1,2,3]
                }, assetsLoc);
            });
        })

    ;

})();