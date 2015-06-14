"use strict";

(function () {

    angular.module('bw.battlefield.renderer', [
    ])

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
            return {
                init: function() {
                    if (!inited) {
                        inited = true;
                    }
                },
                createUnitSprites: function(game, stage) {
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
                                var unitSprites = UnitRender.createUnitSprites(unit);

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
                    createRenderer: function(holder, width, height) {

                        var renderer = PIXI.autoDetectRenderer(width || 800, height || 600, { antialias: false });
                        holder.appendChild(renderer.view);

                        // create the root of the scene graph
                        var stage = new PIXI.Container();


                        addBackground(stage, renderer);

                        var unitStage = new PIXI.Container();
                        unitStage.position.set(30, 30);
                        //unitStage.position.x = 30;
                        //unitStage.position.y = 30;
                        stage.addChild(unitStage);

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
                            unitStage: unitStage,
                            onEachRound: function(onEachRound1) {
                                onEachRound = onEachRound1;
                            },
                            destroy: function() {
                                stopped = true;
                            }
                        };
                    }
                };
            }
        })
    ;

})();