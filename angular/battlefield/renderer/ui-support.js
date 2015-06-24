"use strict";

(function () {

    angular.module('bw.battlefield.ui-support', [
    ])
        .factory("GameUISupport", function(Renderers, $http) {

            var explosionData = [];
            var explosionScale = 1.5;

            var texture = PIXI.Texture.fromImage(Renderers.getAssetsLoc() + "/sprites/explosion/explosion.png");
            $http.get(Renderers.getAssetsLoc() + "/sprites/explosion/explosion.json").success(function(data) {
                for (var i = 0; i < 6; i++) {
                    var frame = data.frames["explosion_explode_" + i + ".png"];
                    frame.texture = new PIXI.Texture(texture, new PIXI.Rectangle(frame.frame.x,frame.frame.y,frame.frame.w,frame.frame.h));
                    if (frame.fixX == null) frame.fixX = 0;
                    if (frame.fixY == null) frame.fixY = 0;
                    explosionData[i] = frame;
                }
            });



            return {
                createGameUISupport: function(stage) {

                    var explosions = [];

                    return {
                        explosion: function(position) {
                            var sprite = new PIXI.Sprite(explosionData[0].texture);
                            sprite.anchor.set(0.5, 0.5);

                            sprite.scale.set(2, 2);

                            sprite.position.x = Math.round(position.x) + explosionData[0].fixX * explosionScale;
                            sprite.position.y = Math.round(position.y) + explosionData[0].fixY * explosionScale;

                            stage.addChild(sprite);

                            var time = new Date().getTime();
                            explosions.push({
                                stage: 0,
                                sprite: sprite,
                                position: position,
                                since: time,
                                until: time + 600
                            });
                        },
                        updateUI: function() {
                            var time = new Date().getTime();
                            for (var i = explosions.length - 1; i > -1; i--) {
                                var explosion = explosions[i];

                                if (explosion.until <= time) {
                                    stage.removeChild(explosion.sprite);
                                    explosions.splice(i, 1);
                                    continue;
                                }

                                var newStage = Math.floor((time - explosion.since) / 100);
                                if (newStage != explosion.stage) {
                                    explosion.stage = newStage;
                                    var ed = explosionData[newStage];
                                    explosion.sprite.texture = ed.texture;

                                    explosion.sprite.position.x = Math.round(explosion.position.x) + ed.fixX * explosionScale;
                                    explosion.sprite.position.y = Math.round(explosion.position.y) + ed.fixY * explosionScale;
                                }
                            }
                        }
                    };
                }
            };
        })
    ;

})();