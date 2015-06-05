"use strict";

(function () {

    angular.module('bw.sprite.editor', [
    ])

        .directive("spriteSheetEditor", function($http, SSE) {
            return {
                restrict: "A",
                scope: {
                    spriteSheet: "=spriteSheetEditor"
                },
                link: function($scope, elem, attrs) {

                    var width = attrs.width || 800;
                    var height = attrs.height || 600;

                    var editor;
                    $http.get($scope.spriteSheet.jsonUrl).success(function(data) {
                        var imageUrl = $scope.spriteSheet.jsonUrl.replace(/\w+\.json$/, '') + data.meta.image;
                        editor = SSE.createSSE(elem[0], width, height, data, imageUrl, $scope.spriteSheet.gridMode);

                        editor.onChangeData(function() {
                            $http.post($scope.spriteSheet.jsonUrl, data);
                        });
                    });


                    $scope.$on("$destroy", function() {
                        if (editor) {
                            editor.destroy();
                        }
                    });
                }
            };
        })

        .factory("SSESprites", function() {
            return {
                createFrameSprite: function (frameData) {
                    var container = new PIXI.Container();

                    var gGrid = new PIXI.Graphics();
                    gGrid.interactive = true;
                    gGrid.hitArea = new PIXI.Rectangle(frameData.frame.x, frameData.frame.y, frameData.frame.w, frameData.frame.h);

                    var over = false;

                    function paint() {
                        gGrid.clear();

                        if (over) {
                            gGrid.moveTo(frameData.frame.x, frameData.frame.y);
                            gGrid.lineStyle(1, 0xAAAAAA, 1);
                            gGrid.lineTo(frameData.frame.x + frameData.frame.w, frameData.frame.y);
                            gGrid.lineTo(frameData.frame.x + frameData.frame.w, frameData.frame.y + frameData.frame.h);
                            gGrid.lineTo(frameData.frame.x, frameData.frame.y + frameData.frame.h);
                            gGrid.lineTo(frameData.frame.x, frameData.frame.y);

                        }

                        gGrid.beginFill(0xFF0000, 0.5);
                        gGrid.lineStyle(null);
                        var rw = 6;
                        var rh = 4;
                        gGrid.drawEllipse(
                            frameData.frame.x +  frameData.frame.w / 2 - (frameData.fixX||0),
                            frameData.frame.y + frameData.frame.h / 2 - (frameData.fixY||0),
                            rw,
                            rh);
                        gGrid.endFill();
                    }

                    // set the mouseover callback...
                    gGrid.on('mouseover', function() {
                        over = true;
                        paint();
                    });
                    gGrid.on('mouseout', function() {
                        over = false;
                        paint();
                    });

                    gGrid.on('mouseup', function(event) {
                        var newPosition = event.data.getLocalPosition(this.parent);
                        frameData.fixX = Math.round(-(newPosition.x - (frameData.frame.x +  frameData.frame.w / 2)));
                        frameData.fixY = Math.round(-(newPosition.y - (frameData.frame.y +  frameData.frame.h / 2)));
                        if (frameData.fixX == 0) {
                            delete frameData.fixX;
                        }
                        if (frameData.fixY == 0) {
                            delete frameData.fixY;
                        }
                        paint();
                    });

                    paint();

                    container.addChild(gGrid);
                    return container;
                }
            };
        })

        .factory("SSEGridMode", function() {
            function createVerLine(x, height) {
                var g = new PIXI.Graphics();
                g.lineStyle(1, 0x000000, 0.1);
                g.moveTo(x, -20);
                g.lineTo(x, height);
                return g;
            }

            function allowDrag(btn, onDragStart, onDragEnd, onDragging) {
                var dragging = false;
                btn.on("mousedown", function(event) {
                    onDragStart(event);
                    dragging = true;
                });

                var _dragEnd = function(event) {

                    var newPosition = event.data.getLocalPosition(this.parent);
                    onDragEnd(newPosition);
                    dragging = false;
                };

                btn.on('mousemove', function(event) {
                    if (dragging) {
                        var position = event.data.getLocalPosition(this.parent);
                        onDragging(position);
                    }
                });

                btn.on("mouseup", _dragEnd );
                btn.on('mouseupoutside', _dragEnd);
            }

            function createHorLine(y, width, onChange) {
                var g = new PIXI.Graphics();

                var btn = new PIXI.Graphics();
                btn.interactive = true;
                btn.buttonMode = true;
                btn.hitArea = new PIXI.Rectangle(-20 - 3, y - 3, 6, 6);

                function paint() {
                    g.clear();
                    g.lineStyle(1, 0x000000, 0.1);
                    g.moveTo(-20, y);
                    g.lineTo(width, y);

                    btn.clear();
                    btn.beginFill(0xAAAA44, 1);
                    btn.alpha = 0.5;
                    btn.drawRect(-20 - 3, y - 3, 6, 6);
                    btn.endFill();
                }
                paint();

                var oldY;
                allowDrag(btn,
                    function (event) {
                        btn.alpha = 1;
                        oldY = y;
                    },
                    function (newPos) {
                        btn.alpha = 0.5;
                        onChange(Math.round(newPos.y), oldY);
                    },
                    function(newPos) {
                        y = newPos.y;
                        btn.hitArea = new PIXI.Rectangle(-20 - 3, y - 3, 6, 6);
                        paint();
                    }
                );

                var container = new PIXI.Container();
                container.addChild(g);
                container.addChild(btn);
                return container;
            }

            function updateYAll(frames, onChange) {
                return function(newY, oldY) {
                    for (var name in frames) {
                        var frame = frames[name];
                        if (frame.frame.y == oldY) {
                            frame.frame.y = newY;
                        } else if (frame.frame.y + frame.frame.h == oldY) {
                            frame.frame.h = newY - frame.frame.y;
                        }
                    }
                    onChange();
                };
            }

            return {
                createGrid: function(frames, width, height, onChange) {
                    var xs = [];
                    var ys = [];

                    function addX(x) {
                        if (xs.indexOf(x) == -1) {
                            xs.push(x);
                        }
                    }
                    function addY(y) {
                        if (ys.indexOf(y) == -1) {
                            ys.push(y);
                        }
                    }

                    for (var name in frames) {
                        var frame = frames[name].frame;

                        addX(frame.x);
                        addX(frame.x + frame.w);
                        addY(frame.y);
                        addY(frame.y + frame.h);
                    }

                    xs.sort();
                    ys.sort();


                    var container = new PIXI.Container();
                    for (var i = 0; i < xs.length; i++) {
                        var x = xs[i];
                        container.addChild(createVerLine(x, height))
                    }
                    for (var i = 0; i < ys.length; i++) {
                        var y = ys[i];
                        container.addChild(createHorLine(y, width, updateYAll(frames, onChange)))
                    }
                    return container;
                }
            };
        })

        .factory("SSE", function(SSESprites, SSEGridMode) {

            function createBackground(color, width, height) {
                var g = new PIXI.Graphics();
                g.beginFill(color);
                g.drawRect(0, 0, width, height);
                g.endFill();
                return g;
            }

            return {
                createSSE: function (elem, width, height, data, imageUrl, isGrid) {

                    var renderer = PIXI.autoDetectRenderer(width, height, { antialias: true });

                    elem.appendChild(renderer.view);

                    var stage = new PIXI.Container();

                    stage.addChild(createBackground(0xFFFFFF, width, height));

                    var stopped = false;
                    if (!stopped) {
                        requestAnimationFrame( animate );
                    }

                    var container = new PIXI.Container();
                    var texture = PIXI.Texture.fromImage(imageUrl);
                    container.addChild(new PIXI.Sprite(texture));
                    container.position.set(50, 50);

                    var editControlContainer = new PIXI.Container();
                    container.addChild(editControlContainer);

                    stage.addChild(container);

                    function animate() {
                        renderer.render(stage);
                        if (!stopped) {
                            requestAnimationFrame( animate );
                        }
                    }

                    var onChangeData;

                    if (isGrid) {
                        editControlContainer.addChild(SSEGridMode.createGrid(data.frames, width, height, function() {
                            if (onChangeData) onChangeData();
                        }));
                    } else {
                        for (var frameName in data.frames) {
                            var frameData = data.frames[frameName];
                            var frameSprite = SSESprites.createFrameSprite(frameData);
                            editControlContainer.addChild(frameSprite);
                        }
                    }

                    return {
                        destroy: function() {
                            stopped = true;
                        },
                        onChangeData: function(onChangeData1) {
                            onChangeData = onChangeData1;
                        }
                    };
                }
            };
        })
    ;


})();