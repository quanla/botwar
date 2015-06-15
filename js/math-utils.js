var Distance = {};
Distance.between = function(p1, p2) {
    return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y));
};

var Cols = Cols || {};

Cols.findMin = function(col, func) {
    var minE;
    var minV;

    col.forEach(function(e) {
        var v = func(e);
        if (minV == null || minV > v) {
            minE = e;
            minV = v;
        }
    });
    return minE;
};

var Vectors = {};
Vectors.vectorPos = function(v) {
    var calAngle = (Math.PI / 2) - v.direction;
    var x1 = Math.cos(calAngle) * v.value;
    var y1 = Math.sin(calAngle) * v.value;
    return {x: x1, y: -y1};
};

Vectors.toVector = function(vectorPos) {
    var value = Math.sqrt(vectorPos.x * vectorPos.x + vectorPos.y * vectorPos.y);
    var direction = -Math.asin(vectorPos.y / value);
    if (vectorPos.x < 0) {
        direction = Math.PI - direction;
    }
    return {
        value: value,
        direction: (Math.PI / 2) - direction
    }
};
Vectors.add = function(v1, v2) {
    var p1 = Vectors.vectorPos(v1);
    var p2 = Vectors.vectorPos(v2);
    var toVector = Vectors.toVector(Vectors.addPos(p1, p2));

    return toVector;
};
Vectors.addPos = function(p1, p2) {
    return {x: p1.x + p2.x, y: p1.y + p2.y};
};

Vectors.subtractPos = function(p, by) {
    return {x: p.x - by.x, y: p.y - by.y};
};




var ColLink = function(oriCol, createFunc, removeFunc) {
    this.oriCol = oriCol;
    if (this.oriCol == null) {
        null["oriCol Must Not Be Null"];
    }
    this.createFunc = createFunc;
    this.removeFunc = removeFunc;
    this.link = [];
};

ColLink.prototype = {
    findO: function(o, start) {
        for (var i = start; i < this.link.length; i++) {
            var h = this.link[i];
            if (h.o === o) {
                return i;
            }
        }
        return -1;
    },
    sync: function() {
        // Loop through indexes that both col has
        for (var i = 0; i < this.link.length && i < this.oriCol.length; i++) {
            var h = this.link[i];

            var o = this.oriCol[i];
            if (h.o === o) {
                // Good to go
                continue
            } else {

                var index = this.findO(o, i+1);
                if (index > -1) {
                    // If o match somewhere else: Bring the it here
                    var theH = this.link[index];
                    this.link.splice(index, 1);
                    this.link.splice(i, 0, theH);
                } else {
                    // Else: o not match any where: new elem, add it here
                    var l = this.createFunc(o);
                    this.link.splice(i, 0, {o: o, l: l});
                }
            }
        }

        if (i < this.link.length) {
            // Link col has more elems than oriCol
            // Remove all extras
            if (this.removeFunc) {
                for (var j = i; j < this.link.length; j++) {
                    var h = this.link[j];
                    this.removeFunc(h.l);
                }
            }
            this.link.splice(i, this.link.length - i);
        } else if (i < this.oriCol.length) {
            // OriCol has more elems
            // Add new elems to link col
            for (var j = i; j < this.oriCol.length; j++) {
                var o = this.oriCol[j];
                var l = this.createFunc(o);
                this.link.push({o: o, l: l});
            }
        }

    },
    removeAll: function() {
        var colLink = this;
        if (colLink.removeFunc) {
            this.link.forEach(function(h) {
                colLink.removeFunc(h.l);
            });
        }
        this.link.splice(0, this.link.length);
    }
};