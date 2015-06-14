"use strict";

(function () {

    angular.module('bw.battlefield.renderer.unit.land-unit', [
        'bw.battlefield.renderer.unit',
        'bw.battlefield.unit-physics'
    ])

        .factory("ColorMatrix", function() {
            return {
                red: [
                    0,   0, 0.8,   0,  0,
                    0,   1,   0,   0,  0,
                    1,   0,   0,   0,  0,
                    0,   0,   0,   1,  0
                ],
                white: [
                    0,   0,   1,   0,  0,
                    0,   0,   1,   0,  0,
                    0,   0,   1,   0,  0,
                    0,   0,   0,   1,  0
                ],
                green: [
                    1,   0,   0,   0,  0,
                    0,   0, 0.7,   0,  0,
                    0,   1,   0,   0,  0,
                    0,   0,   0,   1,  0
                ]
            };
        })

        .factory("LandUnitRender", function($http) {


            function getFightStateNum(stateAge, fightConfig) {
                return fightConfig.steps[stateAge];
            }

            return {
                createLandUnitRender: function(unitType, baseSideColor, fightConfig, assetsLoc) {
                    var textures = null;
                    var badgeTexturess = {};
                    var createBadgeTextures;
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

                    function getBadgeBaseTextures(color) {
                        var badgeTextures = badgeTexturess[color];

                        if (badgeTextures == null && createBadgeTextures != null) {
                            badgeTextures = createBadgeTextures(color);
                            badgeTexturess[color] = badgeTextures;
                        }

                        return badgeTextures;
                    }


                    var init = function() {
                        inited = true;

                        var baseTexture = PIXI.Texture.fromImage(assetsLoc + "/sprites/" + unitType + "/" + unitType + ".png");

                        $http.get(assetsLoc + "/sprites/" + unitType + "/" + unitType + ".json").success(function(res) {
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


                            createBadgeTextures = function(color) {
                                var baseTexture = PIXI.Texture.fromImage(assetsLoc + "/sprites/" + unitType + "/" + unitType + "_badge_" + color + ".png");

                                var badgeTextures = {};
                                for (var fName in framesData) {
                                    var r = framesData[fName].frame;
                                    badgeTextures[fName.replace(/\.png$/, "")] = new PIXI.Texture(baseTexture, new PIXI.Rectangle(r.x, r.y, r.w, r.h))
                                }
                                return badgeTextures;
                            };
                        });

                    };

                    //init();


                    var aniSpeed = 10;
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

                            var colorBadge;
                            if (unit.side.color != baseSideColor) {
                                colorBadge = new PIXI.Sprite();
                                container.addChild(colorBadge);
                            }

                            function eachBody(f) {
                                f(body);
                                if (colorBadge) {
                                    f(colorBadge);
                                }
                            }

                            eachBody(function(body) {
                                body.anchor.set(0.5, 0.5);
                            });

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
                                    dirNum = dirNum % 8;
                                    if (dirNum < 0) dirNum += 8;
                                    if (dirNum > 4) {
                                        dirNum = 8 - dirNum;
                                        flipped = true;
                                    }


                                    var stateNum;
                                    if (state.freezeNum != null) {
                                        stateNum = state.freezeNum;
                                    } else {
                                        var stateAge = Math.floor((round - state.since) / aniSpeed);
                                        if (state.name == "stand") {
                                            stateNum = 0;
                                        } else if (state.name == "walk") {
                                            stateNum = Math.floor(stateAge % 4);
                                        } else if (state.name == "fight") {
                                            stateNum = getFightStateNum(stateAge, fightConfig);
                                        } else if (state.name == "die") {
                                            stateNum = Math.min(stateAge, 2);
                                            if (stateAge > 20) {
                                                container.alpha = 1 - Math.min((stateAge - 20) / 30, 1);
                                                //eachBody(function(body) {
                                                //    body.alpha = 1 - Math.min((stateAge - 20) / 30, 1)
                                                //});
                                                //return;
                                            }
                                        }
                                    }

                                    container.position.x = Math.round(unit.position.x);
                                    container.position.y = Math.round(unit.position.y);

                                    var fixTexture = getFixTexture(unit.type, state.name, stateNum, dirNum);

                                    eachBody(function(body) {
                                        body.scale.x = flipped ? -1 : 1;
                                        body.position.x = fixTexture && fixTexture.x ? fixTexture.x * (flipped ? -1:1) : 0;
                                        body.position.y = fixTexture && fixTexture.y ? fixTexture.y : 0;
                                    });

                                    setTexture(unit.type, state.name, stateNum, dirNum, textures, body);
                                    if (colorBadge) {
                                        setTexture(unit.type, state.name, stateNum, dirNum, getBadgeBaseTextures(unit.side.color), colorBadge);
                                    }

                                    //if (unit.isHit) {
                                    //    hitFilter.show(round - unit.isHit.since);
                                    //} else {
                                    //    hitFilter.hide();
                                    //}
                                }
                            };
                        }
                    };
                }
            };
        })

    ;

})();