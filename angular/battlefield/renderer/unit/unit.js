"use strict";

(function () {

    angular.module('bw.battlefield.renderer.unit', [
        'bw.battlefield.renderer.unit.land-unit'
    ])

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