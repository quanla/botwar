"use strict";

(function () {

    angular.module('bw.battlefield.renderer.unit', [
        'bw.battlefield.renderer.unit.land-unit'
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

        .factory("HitFilter", function() {
            return {
                createHitFilter: function(colorMatrixCombi) {

                    var matrix = [
                        1,   0,   0,   0, 0,
                        0,   1,   0,   0, 0,
                        0,   0,   1,   0, 0,
                        0,   0,   0,   1, 0
                    ];

                    var visible = false;

                    return {
                        show: function(age) {
                            if (!visible) {
                                colorMatrixCombi.addMatrix(matrix);
                                visible = true;
                            }
                            var val =
                                age == 1 ? 2 :
                                age == 2 ? 1.1 :
                                    1;
                            ObjectUtil.copy([
                                val,   0,   0,   0, 0,
                                0,   val,   0,   0, 0,
                                0,   0,   val,   0, 0,
                                0,   0,   0,   1, 0
                            ], matrix);
                            colorMatrixCombi.update();
                        },
                        hide: function() {
                            if (visible) {
                                colorMatrixCombi.removeMatrix(matrix);
                                visible = false;
                            }
                        }
                    };
                }
            };
        })
    ;

})();