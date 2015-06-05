"use strict";

(function () {

    angular.module('bw.posture.editor', [
    ])

        .directive("postureEditor", function(PE) {
            return {
                restrict: "A",
                link: function($scope, elem, attrs) {

                    var width = attrs.width || 800;
                    var height = attrs.height || 600;

                    var editor = PE.createSSE(elem[0], width, height);

                    $scope.$watch("postureEditor.imageUrl", function(imageUrl) {
                        editor.setData(imageUrl, $scope.postureEditor.data);
                    });
                    $scope.$watch("postureEditor.frames", function(frames) {
                        editor.setFrames(frames);
                    });


                    $scope.$on("$destroy", function() {
                        if (editor) {
                            editor.destroy();
                        }
                    });
                }
            };
        })

        .factory("PE", function() {

            function createBackground(color, width, height) {
                var g = new PIXI.Graphics();
                g.beginFill(color);
                g.drawRect(0, 0, width, height);
                g.endFill();
                return g;
            }

            function centerRedDot() {
                var gDot = new PIXI.Graphics();
                gDot.beginFill(0xFF0000, 0.7);
                gDot.lineStyle(null);
                var rw = 10;
                var rh = 6;
                gDot.drawEllipse(
                    0,
                    0,
                    rw,
                    rh);
                gDot.endFill();
                return gDot;
            }

            function supportDrag(sprite, onDragDone) {

                sprite.interactive = true;
                sprite.buttonMode = true;

                var dragging = false;
                var elemStartPos;
                var eventStartPos;
                sprite.on("mousedown", function(event) {
                    dragging = true;
                    elemStartPos = {x: sprite.x, y: sprite.y};
                    eventStartPos = event.data.getLocalPosition(this.parent);
                });
                sprite.on("mouseup", function(event) {
                    dragging = false;
                    if (onDragDone) {
                        onDragDone(sprite.position, elemStartPos);
                    }
                });

                sprite.on("mousemove", function(event) {
                    if (dragging) {
                        var mousePos = event.data.getLocalPosition(this.parent);

                        var newPos = Vectors.addPos(Vectors.subtractPos(mousePos, eventStartPos), elemStartPos);
                        sprite.position.x = newPos.x;
                        sprite.position.y = newPos.y;
                    }
                });

            }

            return {
                createSSE: function (elem, width, height) {

                    var renderer = PIXI.autoDetectRenderer(width, height, { antialias: false });

                    elem.appendChild(renderer.view);

                    var stage = new PIXI.Container();

                    stage.addChild(createBackground(0xFFF9F9, width, height));

                    var stopped = false;
                    if (!stopped) {
                        requestAnimationFrame( animate );
                    }

                    var container = new PIXI.Container();
                    container.position.set(Math.round(width/2), Math.round(height * 5/8));

                    var spriteTexture;

                    var frameSprite = new PIXI.Sprite(null);
                    frameSprite.scale.set(4,4);
                    frameSprite.anchor.set(0.5,0.5);
                    container.addChild(frameSprite);


                    supportDrag(frameSprite, function(newPos) {
                        var frame = framesData[frames[frameIndex]];
                        frame.fixX = Math.round(newPos.x / 4);
                        frame.fixY = Math.round(newPos.y / 4);
                    });


                    container.addChild(centerRedDot());

                    var editControlContainer = new PIXI.Container();
                    container.addChild(editControlContainer);
                    stage.addChild(container);

                    function animate() {
                        renderer.render(stage);
                        if (!stopped) {
                            requestAnimationFrame( animate );
                        }
                    }

                    var framesData;
                    var frames;

                    var frameIndex;

                    function reloadFrames() {
                        if (Cols.isNotEmpty(frames) && spriteTexture != null) {
                            frameIndex = 0;

                            reloadFrame();
                        } else {
                            frameIndex = null;
                        }
                    }

                    function reloadFrame() {
                        if (frameIndex!=null) {

                            var frame = framesData[frames[frameIndex]];
                            var f = frame.frame;
                            frameSprite.texture = new PIXI.Texture(spriteTexture, new PIXI.Rectangle(f.x, f.y, f.w, f.h ));

                            frameSprite.position.x = 0 + 4*(frame.fixX||0);
                            frameSprite.position.y = 0 + 4*(frame.fixY||0);
                        }
                    }

                    function nextFrame() {
                        frameIndex++;
                        if (frameIndex == frames.length) {
                            frameIndex = 0;
                        }
                        reloadFrame();
                    }
                    function prevFrame() {
                        frameIndex--;
                        if (frameIndex == -1) {
                            frameIndex = frames.length - 1;
                        }
                        reloadFrame();
                    }

                    window.addEventListener('keydown', function(event) {
                        if (event.keyCode == 39) {
                            nextFrame();
                        } else if (event.keyCode == 37) {
                            prevFrame();
                        }
                    }, false);

                    return {
                        setData: function(imageUrl, framesData1) {
                            if (imageUrl != null) {
                                spriteTexture = PIXI.Texture.fromImage(imageUrl);
                                framesData = framesData1;
                                reloadFrames();
                            }
                        },
                        setFrames: function(frames1) {
                            frames = frames1;
                            reloadFrames();
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