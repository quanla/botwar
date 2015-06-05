"use strict";

(function () {

    angular.module('bw.battlefield.renderer.unit.arrow', [
    ])

        .factory("ArrowRender", function(UnitTexture) {
            var render;
            return render = {
                aniSpeed: null,
                createUnitSprites: function(unit) {
                    var container = new PIXI.Container();

                    var texture = PIXI.Texture.fromImage("/botwar/assets/sprites/arrow.png");
                    var body = new PIXI.Sprite(new PIXI.Texture(texture, new PIXI.Rectangle(0,0, 68, 68)));

                    body.position.y = -10;

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
        })
    ;

})();