"use strict";

(function () {

    angular.module('bw.common.unit-position', [
    ])

        .factory("PositionGenerator", function() {
            return {
                generatePositions: function(side, unitConfigs, bfwidth, bfheight) {
                    var posType = {
                        "archer": "rear",
                        "footman": "front",
                        "knight": "flank"
                    };

                    var front = Cols.sum(unitConfigs, function(u) { return u.type == 'footman' ? u.count : 0; });
                    var rear = Cols.sum(unitConfigs, function(u) { return u.type == 'archer' ? u.count : 0; });
                    var flank = Cols.sum(unitConfigs, function(u) { return u.type == 'knight' ? u.count : 0; });



                    var positions = [];

                    var space = 60;
                    // Add front
                    function addLine(count, type, x) {
                        if (count % 2 == 0) {
                            var y = 0;
                            for (var i = 0; i < count / 2; i++) {
                                y = space / 2 + i * space;
                                positions.push({x: x, y: y, type: type});
                                positions.push({x: x, y: -y, type: type});
                            }
                            return y;
                        } else {
                            var y = 0;
                            positions.push({x: x, y: y, type: type});
                            for (var i = 0; i < (count - 1) / 2; i++) {
                                y = space + i * space;
                                positions.push({x: x, y:  y, type: type});
                                positions.push({x: x, y: -y, type: type});
                            }
                            return y;
                        }
                    }

                    var y = addLine(front, "front", 0);
                    y = Math.max(y, addLine(rear, "rear", -space));

                    function addFlank(count, y) {
                        var top = Math.ceil(count / 2);
                        var bottom = count - top;

                        for (var i = 0; i < top; i++) {
                            positions.push({x: -i*space, y: - space - y, type: "flank"});
                        }
                        for (var i = 0; i < bottom; i++) {
                            positions.push({x: -i*space, y:   space + y, type: "flank"});
                        }
                    }
                    addFlank(flank, y);



                    return function(unitType) {
                        var pos = Cols.find(positions, function(p) { return p.type == posType[unitType];});
                        Cols.remove(pos, positions);
                        return {x: Math.round(pos.x)*(side==0 ? 1 : -1) + 100 + side*300, y: Math.round(pos.y + bfheight/2)};
                    }
                }
            };
        })
    ;

})();