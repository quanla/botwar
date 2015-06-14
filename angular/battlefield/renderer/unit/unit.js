"use strict";

(function () {

    angular.module('bw.battlefield.renderer.unit', [
    ])

        .provider("UnitRender", function() {
            var typeConfigs = {};
            this.addType = function(name, creater) {
                typeConfigs[name] = creater;
            };
            this.$get = function(Renderers, $injector) {
                var types = {};
                for (var typeName in typeConfigs) {
                    types[typeName] = $injector.invoke(typeConfigs[typeName], null, {assetsLoc: Renderers.getAssetsLoc()});
                }

                return {
                    createUnitSprites: function(unit) {
                        var unitSprites = types[unit.type].createUnitSprites(unit);
                        unitSprites.unit = unit;
                        unitSprites.isDirt = function() {
                            return unit.state != null && unit.state.name == "die";
                        };
                        return unitSprites;
                    }
                };
            }
            ;

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