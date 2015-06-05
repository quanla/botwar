"use strict";

(function () {

    angular.module('bw.battlefield.renderer.unit.land-unit', [
        'bw.battlefield.renderer.unit.arrow'
    ])
        .factory("FootmanRender", function(LandUnitRender) {
            return LandUnitRender.createLandUnitRender({
                steps: [0,1,2,3]
            });
        })
        .factory("ArcherRender", function(LandUnitRender) {
            return LandUnitRender.createLandUnitRender({
                steps: [0,0,0,1]
            });
        })

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

        .factory("LandUnitRender", function(UnitTexture, HitFilter, ColorMatrixCombi, ColorMatrix) {
            function getFightStateNum(stateAge, fightConfig) {
                return fightConfig.steps[stateAge];
            }
            return {
                createLandUnitRender: function(fightConfig) {
                    var render;
                    return render = {
                        aniSpeed: null,
                        createUnitSprites: function(unit) {
                            var container = new PIXI.Container();

                            if (unit.decor) {
                                var g = new PIXI.Graphics();
                                g.lineStyle(2, 0x00FF00, 1);
                                g.drawCircle(0, 0, 10);
                                container.addChild(g);
                            }

                            var texture = UnitTexture.getTexture(unit.type, "stand", 0, 0);

                            var body = new PIXI.Sprite(texture);


                            container.addChild(body);

                            var colorMatrixCombi = ColorMatrixCombi.createColorMatrixCombi();

                            var colorBadge;
                            if (unit.side.color != "blue") {
                                colorBadge = new PIXI.Sprite(UnitTexture.getBadgeTexture(unit.type, "stand", 0, 0));
                                var filter = new PIXI.filters.ColorMatrixFilter();
                                filter.matrix = ColorMatrix[unit.side.color];
                                colorBadge.filters = [filter];
                                container.addChild(colorBadge);
                            }

                            var hitFilter = HitFilter.createHitFilter(colorMatrixCombi);

                            function eachBody(f) {
                                f(body);
                                if (colorBadge) {
                                    f(colorBadge);
                                }
                            }

                            eachBody(function(body) {
                                //body.filters = [colorMatrixCombi.filter];
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
                                        var stateAge = Math.floor((round - state.since) / render.aniSpeed);
                                        if (state.name == "stand") {
                                            stateNum = 0;
                                        } else if (state.name == "walk") {
                                            stateNum = Math.floor(stateAge % 4);
                                        } else if (state.name == "fight") {
                                            stateNum = getFightStateNum(stateAge, fightConfig);
                                        } else if (state.name == "die") {
                                            stateNum = Math.min(stateAge, 2);
                                            if (stateAge > 100) {
                                                eachBody(function(body) {
                                                    body.alpha = 1 - Math.min((stateAge - 100) / 100, 1)
                                                });
                                            }
                                        }
                                    }


                                    container.position.x = Math.round(unit.position.x);
                                    container.position.y = Math.round(unit.position.y);

                                    var fixTexture = UnitTexture.fixTexture(unit.type, state.name, stateNum, dirNum);

                                    eachBody(function(body) {
                                        body.scale.x = flipped ? -1 : 1;
                                        body.position.x = fixTexture && fixTexture.x ? fixTexture.x * (flipped ? -1:1) : 0;
                                        body.position.y = fixTexture && fixTexture.y ? fixTexture.y : 0;
                                    });
                                    body.texture = UnitTexture.getTexture(unit.type, state.name, stateNum, dirNum);
                                    if (colorBadge) {
                                        colorBadge.texture = UnitTexture.getBadgeTexture(unit.type, state.name, stateNum, dirNum);
                                    }

                                    if (unit.isHit) {
                                        hitFilter.show(round - unit.isHit.since);
                                    } else {
                                        hitFilter.hide();
                                    }
                                }
                            };
                        }
                    };
                }
            };
        })

    ;

})();