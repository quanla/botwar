"use strict";

(function () {

    angular.module('bw.battlefield.units.zerling', [
        'bw.battlefield.renderer.unit.sc-unit',
        'bw.battlefield.unit-dynamics'
    ])

        .config(function(GameSetupProvider, UnitRenderProvider, UnitFightingStyleProvider, UnitPhysicsProvider, UnitImpactProvider) {
            GameSetupProvider.addUnitType("zerling", {
                defaultHitpoint: 50
            });

            UnitFightingStyleProvider.addStyle("zerling", {
                createHitImpact: 10 * 3,
                fightFinish: 10 * 4,
                damage: 20
            });

            UnitPhysicsProvider.addUnitType("zerling", {
                needWay: true,
                maxSpeed: 1
            });

            UnitImpactProvider.addUnitType("zerling", {
                takeHit: true
            });

            UnitRenderProvider.addType("zerling", function(assetsLoc, SCUnitRender) {
                return SCUnitRender.createSCUnitRender("zerling", {
                    steps: [0,1,2,3,4]
                }, assetsLoc);
            });
        })

    ;

})();