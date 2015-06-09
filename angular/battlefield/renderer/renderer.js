"use strict";

(function () {

    angular.module('bw.battlefield.renderer', [
        'bw.battlefield.renderer.unit'
    ])

        .factory("UnitRender", function(FootmanRender, ArcherRender, ArrowRender) {

            return {
                createUnitRender: function(assetsLoc) {
                    var types = {
                        "footman": FootmanRender.createFootmanRender(assetsLoc),
                        "archer": ArcherRender.createArcherRender(assetsLoc),
                        "arrow": ArrowRender,
                        "circle": {
                            createUnitSprites: function(unit) {
                                var g = new PIXI.Graphics();

                                g.beginFill(0xFF0000);
                                g.drawCircle(0, 0, 5);
                                g.endFill();

                                return {
                                    container: g,
                                    sync: function(round) {
                                        g.position.x = unit.position.x;
                                        g.position.y = unit.position.y;
                                    }
                                };
                            }
                        }
                    };


                    return {
                        createUnitSprites: function(unit) {
                            var unitSprites = types[unit.type].createUnitSprites(unit);
                            unitSprites.unit = unit;
                            return unitSprites;
                        }
                    };
                }
            };

        })

        .factory("UnitSprites", function(UnitRender) {
            function isAbove(u1, u2) {
                if (u1.state != null && u1.state.name == "die") {
                    return false;
                } if (u2.state != null && u2.state.name == "die") {
                    return true;
                }

                return u1.position.y > u2.position.y;
            }

            var inited = false;
            var unitRender;
            return {
                init: function(assetsLoc) {
                    if (!inited) {
                        inited = true;
                        unitRender = UnitRender.createUnitRender(assetsLoc);
                    }
                },
                createUnitSprites: function(game, stage, assetsLoc) {
                    var orderCache = [];

                    function checkOrder() {
                        for (var i = 0; i < orderCache.length - 1; i++) {
                            var unitSprites1 = orderCache[i];
                            var unitSprites2 = orderCache[i + 1];

                            if (isAbove(unitSprites1.unit, unitSprites2.unit)) {
                                // Swap
                                orderCache[i] = unitSprites2;
                                orderCache[i + 1] = unitSprites1;

                                stage.swapChildren(unitSprites1.container, unitSprites2.container);
                            }

                        }
                    }

                    function createUnitsLink (units) {
                        return new ColLink(units,
                            function (unit) {
                                var unitSprites = unitRender.createUnitSprites(unit);

                                stage.addChild(unitSprites.container);
                                orderCache.push(unitSprites);
                                return unitSprites;
                            },
                            function (unitSprites) {
                                Cols.remove(unitSprites,orderCache);
                                stage.removeChild(unitSprites.container);
                            }
                        )
                    }

                    var sides = new ColLink(game.sides,
                        function(side) {
                            // Create side link
                            return createUnitsLink(side.units);
                        },
                        function(units) {
                            units.removeAll();
                        }
                    );

                    var nature = createUnitsLink(game.nature);

                    function sync() {
                        sides.sync();
                        sides.link.forEach(function (unitsLink) {
                            unitsLink.l.sync();
                        });
                        nature.sync();
                    }
                    function eachSprite(funcUnitSprite) {
                        var eachHandle = function (h) {
                            var unitSprites = h.l;
                            var unit = h.o;
                            funcUnitSprite(unit, unitSprites);
                        };

                        sides.link.forEach(function (sideLink) {
                            var unitsLink = sideLink.l;
                            unitsLink.link.forEach(eachHandle);
                        });
                        nature.link.forEach(eachHandle);
                    }

                    return {
                        release: function () {
                            sides.removeAll();
                            nature.removeAll();
                        },
                        updateSprites: function (round) {
                            // Sync to remove or add new sprites
                            sync();

                            eachSprite(function (unit, unitSprites) {
                                // Change appearance, location
                                unitSprites.sync(round);
                            });

                            // Change display order
                            checkOrder();
                        }
                    }
                }
            };
        })

        .factory("Renderers", function() {

            function addBackground(stage, renderer, assetsLoc) {
                var grassTexture = PIXI.Texture.fromImage(assetsLoc + '/grass.jpg');
                //var grassTexture = PIXI.Texture.fromImage(assetsLoc + '/grass.png');
                var grassTile = new PIXI.extras.TilingSprite(grassTexture, renderer.width, renderer.height);
                stage.addChild(grassTile);
            }

            return {
                createRenderer: function(holder, width, height, assetsLoc) {

                    var renderer = PIXI.autoDetectRenderer(width || 800, height || 600, { antialias: false });
                    holder.appendChild(renderer.view);

                    // create the root of the scene graph
                    var stage = new PIXI.Container();

                    addBackground(stage, renderer, assetsLoc);

                    var stopped = false;
                    function animate() {

                        if (onEachRound) {
                            onEachRound();
                        }

                        renderer.render(stage);
                        if (!stopped) {
                            requestAnimationFrame( animate );
                        }
                    }

                    var onEachRound;

                    requestAnimationFrame( animate );

                    return {
                        load: function(onLoad1) {
                            onLoad1();
                        },
                        unitStage: stage,
                        onEachRound: function(onEachRound1) {
                            onEachRound = onEachRound1;
                        },
                        destroy: function() {
                            stopped = true;
                        }
                    };
                }
            };
        })
    ;

})();