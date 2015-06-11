"use strict";

(function () {

    angular.module('bw.battlefield.renderer.unit.sc-unit', [
        'bw.battlefield.renderer.unit',
        'bw.battlefield.unit-physics'
    ])

        .factory("SCUnitRender", function($http) {

            return {
                createSCUnitRender: function(unitType, fightConfig, assetsLoc) {
                    var textures = null;
                    var fixes = {};
                    var inited = false;

                    function setTexture(type, state, stateNum, directionNum, textures, sprite) {
                        if (textures==null) {
                            return;
                        }
                        var texture = textures[type + "_" + state + stateNum + "_" + directionNum];
                        if (texture != null) {
                            sprite.texture = texture;
                        }
                    }
                    function getFixTexture(type, state, stateNum, directionNum) {
                        return fixes[type + "_" + state + stateNum + "_" + directionNum];
                    }

                    var init = function() {
                        inited = true;

                        var baseTexture = PIXI.Texture.fromImage(assetsLoc + "/sprites/" + unitType + "/" + unitType + "_move.png");

                        $http.get(assetsLoc + "/sprites/" + unitType + "/" + unitType + "_move.json").success(function(res) {
                            textures = {};
                            var framesData = res.frames;
                            for (var fName in framesData) {
                                var frameData = framesData[fName];
                                var r = frameData.frame;

                                var rect = new PIXI.Rectangle(r.x, r.y, r.w, r.h);
                                textures[fName.replace(/\.png$/, "")] = new PIXI.Texture(baseTexture, rect);
                                var fixX = frameData["fixX"];
                                var fixY = frameData["fixY"];
                                if (fixX != null || fixY != null) {
                                    fixes[fName.replace(/\.png$/, "")] = {x: fixX, y: fixY};
                                }
                            }


                        });

                    };

                    init();


                    var aniSpeed = 6;
                    return {
                        createUnitSprites: function(unit) {
                            if (!inited) {
                                init();
                            }

                            var container = new PIXI.Container();

                            if (unit.decor) {
                                var g = new PIXI.Graphics();
                                g.lineStyle(2, 0x00FF00, 1);
                                g.drawCircle(0, 0, 10);
                                container.addChild(g);
                            }

                            var body = new PIXI.Sprite();

                            container.addChild(body);

                            body.anchor.set(0.5, 0.5);

                            return {
                                container: container,
                                sync: function(round) {

                                    var state = unit.state || {name: "stand"};

                                    var direction = unit.direction || 0;

                                    var flipped = false;
                                    var dirNum = Math.round(direction / (Math.PI / 4));
                                    if (state.name == "die") {
                                        dirNum = Math.floor(dirNum / 2) * 2 + 1;
                                    }
                                    dirNum = dirNum % 16;
                                    if (dirNum < 0) dirNum += 16;
                                    if (dirNum > 8) {
                                        dirNum = 16 - dirNum;
                                        flipped = true;
                                    }


                                    var stateNum;
                                    if (state.freezeNum != null) {
                                        stateNum = state.freezeNum;
                                    } else {
                                        var stateAge = Math.floor((round - state.since) / aniSpeed);
                                        if (state.name == "stand") {
                                            stateNum = 0;
                                        } else if (state.name == "go") {
                                            stateNum = Math.floor(stateAge % 4);
                                        } else if (state.name == "fight") {
                                            stateNum = fightConfig.steps[stateAge];
                                        } else if (state.name == "die") {
                                            stateNum = Math.min(stateAge, 2);
                                            if (stateAge > 100) {
                                                body.alpha = 1 - Math.min((stateAge - 100) / 100, 1)
                                            }
                                        }
                                    }

                                    container.position.x = Math.round(unit.position.x);
                                    container.position.y = Math.round(unit.position.y);

                                    var fixTexture = getFixTexture(unit.type, state.name, stateNum, dirNum);

                                    body.scale.x = flipped ? -1 : 1;
                                    body.position.x = fixTexture && fixTexture.x ? fixTexture.x * (flipped ? -1:1) : 0;
                                    body.position.y = fixTexture && fixTexture.y ? fixTexture.y : 0;

                                    setTexture(unit.type, state.name, stateNum, dirNum, textures, body);
                                }
                            };
                        }
                    };
                }
            };
        })
    ;

})();