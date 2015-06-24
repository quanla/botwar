"use strict";

(function () {

    angular.module('bw.battlefield.renderer', [
    ])

        .factory("UnitSprites", function(UnitRender) {
            function isAbove(u1, u2) {
                return u1.position.y > u2.position.y;
            }

            return {
                createUnitSprites: function(game, unitStage, dirtStage) {
                    var orderCache = [];

                    function checkOrder() {
                        for (var i = 0; i < orderCache.length - 1; i++) {
                            var unitSprites1 = orderCache[i];
                            var unitSprites2 = orderCache[i + 1];

                            if (isAbove(unitSprites1.unit, unitSprites2.unit)) {
                                // Swap
                                orderCache[i] = unitSprites2;
                                orderCache[i + 1] = unitSprites1;

                                unitStage.swapChildren(unitSprites1.container, unitSprites2.container);
                            }

                        }
                    }

                    function createUnitsLink (units) {
                        return new ColLink(units,
                            function (unit) {
                                var unitSprites = UnitRender.createUnitSprites(unit);

                                unitStage.addChild(unitSprites.container);
                                orderCache.push(unitSprites);
                                return unitSprites;
                            },
                            function (unitSprites) {
                                if (unitSprites.inDirtLayer) {
                                    dirtStage.removeChild(unitSprites.container);
                                } else {
                                    Cols.remove(unitSprites,orderCache);
                                    unitStage.removeChild(unitSprites.container);
                                }
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

                                if (unitSprites.inDirtLayer == null && unitSprites.isDirt()) {
                                    unitSprites.inDirtLayer = true;

                                    unitStage.removeChild(unitSprites.container);
                                    dirtStage.addChild(unitSprites.container);

                                    Cols.remove(unitSprites, orderCache);
                                }
                            });

                            // Change display order
                            checkOrder();
                        }
                    }
                }
            };
        })

        .provider("Renderers", function() {
            var renderers = this;
            renderers.assetsLoc = "assets";

            function addBackground(stage, renderer) {
                var grassTexture = PIXI.Texture.fromImage(renderers.assetsLoc + '/grass.jpg');
                //var grassTexture = PIXI.Texture.fromImage(assetsLoc + '/grass.png');
                var grassTile = new PIXI.extras.TilingSprite(grassTexture, renderer.width, renderer.height);
                stage.addChild(grassTile);
            }

            this.$get = function() {


                return {
                    getAssetsLoc: function() {
                        return renderers.assetsLoc;
                    },
                    createRenderer: function(width, height, scale) {

                        var renderer = PIXI.autoDetectRenderer(width, height, { antialias: false });

                        // create the root of the scene graph
                        var stage = new PIXI.Container();

                        if (scale != null) {
                            renderer.view.style.width = Math.round(width * scale) + "px";
                            renderer.view.style.height = Math.round(height * scale) + "px";
                        }

                        addBackground(stage, renderer, scale);

                        var dirtStage = new PIXI.Container();
                        dirtStage.position.set(30, 30);
                        //dirtStage.tint = 0x111AA1;
                        stage.addChild(dirtStage);

                        var unitStage = new PIXI.Container();
                        unitStage.position.set(30, 30);
                        stage.addChild(unitStage);

                        var explosionStage = new PIXI.Container();
                        explosionStage.position.set(30, 30);
                        stage.addChild(explosionStage);

                        var controlStage = new PIXI.Container();
                        controlStage.position.set(30, 30);
                        stage.addChild(controlStage);

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
                            dirtStage: dirtStage,
                            unitStage: unitStage,
                            explosionStage: explosionStage,
                            controlStage: controlStage,
                            onEachRound: function(onEachRound1) {
                                onEachRound = onEachRound1;
                            },
                            destroy: function() {
                                stopped = true;
                            },
                            width: width,
                            height: height,
                            view: renderer.view
                        };
                    }
                };
            }
        })
    ;

})();