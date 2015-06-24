"use strict";

(function () {

    angular.module('bw.battlefield.units.ballista_missile', [
        'bw.battlefield.unit-dynamics',
        'bw.battlefield.renderer.unit',
        'bw.battlefield.unit-physics'
    ])

        .config(function(UnitRenderProvider, UnitFightingStyleProvider, UnitPhysicsProvider, UnitImpactProvider) {

            UnitPhysicsProvider.addUnitType("ballista_missile", {
                bounded: false,
                needWay: false,
                maxSpeed: 10,
                blastRadius: 600
            });

            UnitImpactProvider.addUnitType("ballista_missile", {
                takeHit: false
            });
        })

        .config(function(UnitRenderProvider) {
            UnitRenderProvider.addType("ballista_missile", function(assetsLoc) {
                return {
                    createUnitSprites: function(unit) {
                        var container = new PIXI.Container();

                        var texture = PIXI.Texture.fromImage(assetsLoc + "/sprites/ballista_missile/ballista_missile.png");
                        var body = new PIXI.Sprite(new PIXI.Texture(texture, new PIXI.Rectangle(0,0, 20, 52)));

                        body.position.y = -10;

                        body.position.x += 1;
                        body.position.y += 9;

                        container.addChild(body);

                        body.anchor.set(0.5, 0.5);

                        return {
                            container: container,
                            sync: function(round) {

                                var direction = unit.direction || 0;

                                container.position.x = Math.round(unit.position.x);
                                container.position.y = Math.round(unit.position.y);

                                body.rotation = direction;
                            }
                        };
                    }
                };
            });
        })

    ;

})();