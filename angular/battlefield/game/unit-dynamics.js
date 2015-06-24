"use strict";

(function () {

    angular.module('bw.battlefield.unit-dynamics', [
    ])

        .provider("UnitImpact", function() {
            var types = {};

            var Cal = {};
            Cal.isHit = function(sourcePoint, hitVector, enemyPos, radius) {

                var endPoint = Vectors.addPos(sourcePoint, Vectors.vectorPos(hitVector));
                var endSide = Distance.between(sourcePoint, enemyPos);
                var sourceSide = Distance.between(endPoint, enemyPos);


                var endAngle = Math.acos((sourceSide*sourceSide + hitVector.value*hitVector.value - endSide*endSide) / 2 / sourceSide / hitVector.value);
                if (endAngle <= Math.PI / 2) {
                    var distance = Math.sin(endAngle) * sourceSide;
                    return distance <= radius;
                } else {
                    return sourceSide <= radius;
                }
            };

            this.addUnitType = function(unitType, impactConfig) {
                types[unitType] = impactConfig;
            };

            this.$get = function(GameUtil, UnitPhysics) {

                return {
                    prepare: function(game, round) {

                        function applyHit(unit, props) {
                            unit.hitpoint -= props.damage;
                            var damaged = props.damage;
                            if (unit.hitpoint < 0) {
                                damaged += unit.hitpoint;
                            }
                            unit.isHit = {since: round};

                            if (unit.hitpoint <= 0) {
                                unit.state = {
                                    name: "die",
                                    since: round
                                };
                                unit.moveAccel = 0;
                                unit.botBlockedUtil = null;
                            }

                            props.source.side.score += damaged;
                            if (props.source.side.onScoreChange) {
                                props.source.side.onScoreChange(props.source.side.score);
                            }
                        }

                        return {
                            hit: function(props) {

                                var adjustantEnemies = Cols.filter(GameUtil.getEnemies(props.source), function(enemy) {
                                    if (enemy.state.name == "die" ) {
                                        return false; // Immune to damage
                                    }

                                    if (types[enemy.type].takeHit && enemy.side != props.source.side && Distance.between(props.start, enemy.position) < props.vector.value + 20) {
                                        return true;
                                    }
                                });

                                var canHit = Cols.filter(adjustantEnemies, function(enemy) { return Cal.isHit(props.start, props.vector, enemy.position, 20);});
                                var enemy = Cols.findMin(canHit, function(enemy) { return Distance.between(props.start, enemy.position); });

                                if (enemy != null) {
                                    applyHit(enemy, props);
                                }
                            },
                            makeWay: function(props) {
                                var findPosition = function() {
                                    for (var i = 0; i < props.positions.length; i++) {
                                        var position = props.positions[i];
                                        var blocked = GameUtil.eachUnit(game, function(unit) {
                                            if (unit == props.source) {
                                                return;
                                            }
                                            if (unit.state.name != "die" && unit.isNeedWay()) {
                                                if (Distance.between(unit.position, position) < 20) {
                                                    return true;
                                                }
                                            }
                                        });
                                        if (!blocked) {
                                            return position;
                                        }
                                    }
                                };

                                var newPosition = findPosition();

                                return {
                                    then: function(todo) {
                                        if (newPosition != null) {
                                            todo(newPosition);
                                        }
                                    }
                                };
                            },
                            arrow: function(props) {
                                return GameUtil.eachUnit(game, function(unit) {
                                    if (unit.state.name == "die" ) {
                                        return; // Immune to damage
                                    }

                                    if (types[unit.type].takeHit && props.source.side != unit.side) {

                                        if (Distance.between(unit.position, props.position) < 20) {
                                            applyHit(unit, props);
                                            return true;
                                        }
                                    }
                                });
                            }
                        };
                    }
                };
            };
        })

        .factory("UnitDynamics", function(Dynamics, UnitImpact, GameUtil, UnitPhysics, UnitFightingStyle, BattleSetup) {
            function limitPosition(pos, battlefield) {
                if (pos.x < 0) {
                    pos.x = 0;
                }
                if (pos.y < 0) {
                    pos.y = 0;
                }
                if (pos.x >= battlefield.width) {
                    pos.x = battlefield.width - 1;
                }
                if (pos.y >= battlefield.height) {
                    pos.y = battlefield.height - 1;
                }
            }

            return {
                applyDynamics: function(game, round) {
                    var impact = UnitImpact.prepare(game, round);
                    GameUtil.eachUnit(game, function(unit) {

                        unit.velocity = Dynamics.applyAccel(unit.moveAccel, unit.direction, unit.velocity, unit.maxSpeed);

                        if (unit.velocity != null && unit.velocity.value > 0) {

                            if (unit.isNeedWay()) {
                                var positions = [
                                    Dynamics.applyVelocity(unit.velocity, unit.position),
                                    Dynamics.applyVelocity({value: unit.velocity.value, direction: unit.velocity.direction - 3*Math.PI/8}, unit.position),
                                    Dynamics.applyVelocity({value: unit.velocity.value, direction: unit.velocity.direction + 3*Math.PI/8}, unit.position),
                                    Dynamics.applyVelocity({value: unit.velocity.value, direction: unit.velocity.direction -   Math.PI/2}, unit.position),
                                    Dynamics.applyVelocity({value: unit.velocity.value, direction: unit.velocity.direction +   Math.PI/2}, unit.position)
                                ];
                                impact.makeWay({
                                    positions: positions,
                                    source: unit
                                }).then(function(newPosition) {
                                    unit.position = newPosition;
                                });
                            } else {
                                unit.position = Dynamics.applyVelocity(unit.velocity, unit.position);
                            }
                        }

                        // Battlefield boundary
                        if (unit.isBounded()) {
                            limitPosition(unit.position, game.battlefield);
                        }

                        if (unit.state.name == "fight") {
                            var fightingStyle = UnitFightingStyle.getUnitFightingStyle(unit);
                            if (fightingStyle.createHitImpact && (round - unit.state.since) == fightingStyle.createHitImpact) {
                                impact.hit({
                                    vector: {
                                        direction: unit.direction,
                                        value: 45
                                    },
                                    start: unit.position,
                                    source: unit,
                                    damage: fightingStyle.damage
                                });
                            } else if (fightingStyle.launchCreateArrow && (round - unit.state.since) == fightingStyle.launchCreateArrow) {
                                game.nature.push(BattleSetup.createUnit({
                                    type: "arrow",
                                    state: {name: "fly"},
                                    position: ObjectUtil.clone(unit.position),
                                    start: ObjectUtil.clone(unit.position),
                                    direction: unit.direction,
                                    side: unit.side,
                                    damage: fightingStyle.damage,
                                    moveAccel: 100
                                }));
                            } else if ((round - unit.state.since) == fightingStyle.fightFinish) {
                                unit.state = {name: "stand"};
                            }
                        } else if (unit.state.name == "die") {
                            if (round - unit.state.since > 500) {
                                Cols.remove(unit, unit.side.units);
                            }
                        }

                        if (unit.type == "arrow") {
                            if (
                                impact.arrow({
                                    position: unit.position,
                                    source: unit,
                                    damage: unit.damage
                                })
                                || Distance.between(unit.position, unit.start) > 200
                            ) {
                                Cols.remove(unit, game.nature);
                            }
                        }

                        if (unit.isHit && (round - unit.isHit.since) > 2) {
                            unit.isHit = null;
                        }



                        if (unit.overwrite && unit.overwrite.until) {
                            if (unit.overwrite.until.apply(unit)) {
                                delete unit.overwrite;
                            }
                        }
                    });

                }
            };
        })

        .factory("Dynamics", function() {

            function applyAccel(accel, direction, velocity, maxSpeed) {

                if (accel == null || accel == 0) {
                    return null;
                }

                // Add vectors
                var result = Vectors.add({value: accel, direction: direction}, velocity || {value: 0, direction: 0});
                // Speed limit
                if (result.value > maxSpeed) {
                    result.value = maxSpeed;
                } else if (result.value < -maxSpeed) {
                    result.value = -maxSpeed;
                }

                if (Math.abs(result.value) < 0.00001) {
                    return null;
                }

                return result;
            }
            function applyVelocity(velocity, position) {
                if (velocity == null || velocity.value == 0) {
                    return position;
                }
                var vp = Vectors.vectorPos(velocity);
                return {
                    x: position.x + vp.x,
                    y: position.y + vp.y
                }
            }
            return {
                applyAccel: applyAccel,
                applyVelocity: applyVelocity
            };
        })

    ;

})();