"use strict";

(function () {

    angular.module('bw.sprite.editor', [
    ])

        .factory("SpriteSheetEditors", function() {
            return {
                createSpriteSheetEditor: function() {
                    var imageUrl;
                    var renderer;
                    return {
                        grid: null,
                        setImageUrl: function(imageUrl1) {
                            imageUrl = imageUrl1;
                            if (renderer) renderer.setImageUrl(imageUrl1);
                        },
                        setGrid: function(grid1) {
                            this.grid = grid1;
                            if (renderer) renderer.setGrid(grid1);
                        },
                        getSpriteSheetWidth: function() {
                            return renderer.getSpriteSheetWidth();
                        },
                        getSpriteSheetHeight: function() {
                            return renderer.getSpriteSheetHeight();
                        },
                        setRenderer: function(renderer1) {
                            renderer = renderer1;
                            renderer.setImageUrl(imageUrl);
                            renderer.setGrid(this.grid);
                        }
                    };
                }
            };
        })

        .directive("spriteSheetEditor", function($http, SSERenderer) {
            return {
                restrict: "A",
                link: function($scope, elem, attrs) {

                    var width = attrs.width || 800;
                    var height = attrs.height || 600;

                    var renderer = SSERenderer.createSSE(elem[0], width, height);

                    $scope.$eval(attrs.spriteSheetEditor).setRenderer(renderer);

                    $scope.$on("$destroy", function() {
                        if (renderer) {
                            renderer.destroy();
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

                    var onHover;
                    var onOut;
                    // set the mouseover callback...
                    gGrid.on('mouseover', function() {
                        if (onHover) onHover();
                        over = true;
                        paint();
                    });
                    gGrid.on('mouseout', function() {
                        if (onOut) onOut();
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
                    return {
                        container: container,
                        hover: function(onHover1, onOut1) {
                            onHover = onHover1;
                            onOut = onOut1;
                        }
                    };
                }
            };
        })

        .factory("SSEGridMode", function() {

            function allowDrag(btn, onDragStart, onDragEnd, onDragging) {
                var dragging = false;
                btn.on("mousedown", function(event) {
                    onDragStart(event);
                    dragging = true;
                });

                var _dragEnd = function(event) {

                    var newPosition = event.data.getLocalPosition(this.parent.parent);
                    onDragEnd(newPosition);
                    dragging = false;
                };

                btn.on('mousemove', function(event) {
                    if (dragging) {
                        var position = event.data.getLocalPosition(this.parent.parent);
                        onDragging(position);
                    }
                });

                btn.on("mouseup", _dragEnd );
                btn.on('mouseupoutside', _dragEnd);
            }

            function createHorLine(y, width, onChange) {
                return createLine(1, y, width, onChange);
            }
            function createVerLine(x, height, onChange) {
                return createLine(0, x, height, onChange);
            }

            function createLine(dir, pos, length, onChange) {
                var createPoint = dir == 1 ? function(x, y) { return {x: x, y: y};} : function(x, y) { return {x: y, y: x};};

                var container = new PIXI.Container();
                function setPos(pos) {
                    if (dir == 1) {
                        container.position.y = Math.round(pos.y);
                    } else {
                        container.position.x = Math.round(pos.x);
                    }
                }

                var g = new PIXI.Graphics();

                var btn = new PIXI.Graphics();
                btn.interactive = true;
                btn.buttonMode = true;
                var p;
                btn.hitArea = new PIXI.Rectangle((p = createPoint(-20 - 3, - 3)).x, p.y, 6, 6);

                g.clear();
                g.lineStyle(1, 0x000000, 0.1);
                g.moveTo((p = createPoint(-20, 0)).x, p.y);
                g.lineTo((p = createPoint(length, 0)).x, p.y);

                btn.clear();
                btn.beginFill(0xAAAA44, 1);
                btn.alpha = 0.5;
                btn.drawRect((p = createPoint(-20 - 3, - 3)).x, p.y, 6, 6);
                btn.endFill();

                container.addChild(g);
                container.addChild(btn);

                allowDrag(btn,
                    function (event) {
                        btn.alpha = 1;
                        //oldY;
                    },
                    function (newPos) {
                        btn.alpha = 0.5;
                        onChange(newPos);
                    },
                    setPos
                );

                setPos(createPoint(0, pos));
                return container;
            }

            //function updateYAll(frames, onChange) {
            //    return function(newY, oldY) {
            //        for (var name in frames) {
            //            var frame = frames[name];
            //            if (frame.frame.y == oldY) {
            //                frame.frame.y = newY;
            //            } else if (frame.frame.y + frame.frame.h == oldY) {
            //                frame.frame.h = newY - frame.frame.y;
            //            }
            //        }
            //        onChange();
            //    };
            //}

            return {
                createGrid: function(grid, width, height) {

                    var container = new PIXI.Container();

                    Cols.eachEntry(grid.xs, function(i, x) {
                        container.addChild(createVerLine(x, height, function(pos) {
                            grid.xs[i] = Math.round(pos.x);
                        }))
                    });
                    Cols.eachEntry(grid.ys, function(i, y) {
                        container.addChild(createHorLine(y, width, function(pos) {
                            grid.ys[i] = Math.round(pos.y);
                        }))
                    });
                    return container;
                }
            };
        })

        .factory("SSERenderer", function(SSESprites, SSEGridMode) {

            function createBackground(color, width, height) {
                var g = new PIXI.Graphics();
                g.beginFill(color);
                g.drawRect(0, 0, width, height);
                g.endFill();
                return g;
            }

            return {
                createSSE: function (elem, width, height) {

                    var renderer = PIXI.autoDetectRenderer(width, height, { antialias: false });

                    elem.appendChild(renderer.view);

                    var stage = new PIXI.Container();

                    stage.addChild(createBackground(0xFFFFFF, width, height));

                    var stopped = false;
                    if (!stopped) {
                        requestAnimationFrame( animate );
                    }

                    var container = new PIXI.Container();
                    var spriteSheet = new PIXI.Sprite();
                    container.addChild(spriteSheet);
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

                    return {
                        setGrid: function(grid) {
                            for (var i = editControlContainer.children.length - 1; i >= 0; i--) {
                                editControlContainer.removeChild(editControlContainer.children[i]);
                            }

                            if (grid != null) {
                                editControlContainer.addChild(SSEGridMode.createGrid(grid, width, height, function () {
                                    if (onChangeData) onChangeData();
                                }));
                            }
                        },
                        setImageUrl: function(imageUrl) {
                            if (imageUrl != null) {
                                var texture = PIXI.Texture.fromImage(imageUrl);
                                spriteSheet.texture = texture;
                            }
                        },
                        getSpriteSheetWidth: function() {
                            return spriteSheet.width;
                        },
                        getSpriteSheetHeight: function() {
                            return spriteSheet.height;
                        },
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