"use strict";

(function () {

    angular.module('bw.battlefield.unit-dynamics', [
    ])

        .provider("UnitImpact", function() {
            var types = {};

            this.addUnitType = function(unitType, impactConfig) {
                types[unitType] = impactConfig;
            };

            this.$get = function(GameUtil, UnitPhysics) {
                return {
                    impact: function(type, props, game, round) {

                        if (type == "hit") {
                            // Resolve impact
                            GameUtil.eachUnit(game, function(unit) {
                                if (unit.state != null && unit.state.name == "die" ) {
                                    return; // Immune to damage
                                }

                                if (types[unit.type].takeHit) {
                                    if (Distance.between(unit.position, props.position) < 16) {
                                        unit.hitpoint -= props.damage;
                                        unit.isHit = {since: round};

                                        if (unit.hitpoint <= 0) {
                                            unit.state = {
                                                name: "die",
                                                since: round
                                            };
                                            unit.moveAccel = 0;
                                        }
                                    }
                                }
                            });
                        } else if (type == "makeWay") {
                            var findPosition = function() {
                                for (var i = 0; i < props.positions.length; i++) {
                                    var position = props.positions[i];
                                    var blocked = GameUtil.eachUnit(game, function(unit) {
                                        if (unit == props.source) {
                                            return;
                                        }
                                        var unitPhysics = UnitPhysics.getUnitPhysics(unit);
                                        if (unitPhysics.needWay) {
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
                        } else if (type == "arrow") {
                            return GameUtil.eachUnit(game, function(unit) {
                                if (unit.state != null && unit.state.name == "die" ) {
                                    return; // Immune to damage
                                }

                                if (types[unit.type].takeHit && props.side != unit.side) {

                                    if (Distance.between(unit.position, props.position) < 15) {
                                        unit.hitpoint -= props.damage;
                                        unit.isHit = {since: round};

                                        if (unit.hitpoint <= 0) {
                                            unit.state = {
                                                name: "die",
                                                since: round
                                            };
                                            unit.moveAccel = 0;
                                        }
                                        return true;
                                    }
                                }
                            });
                        }
                    }
                };
            };
        })

        .factory("UnitDynamics", function(Dynamics, UnitImpact, GameUtil, UnitPhysics, UnitFightingStyle) {
            function limitPosition(pos, battlefield) {
                if (pos.x < 0 + 30) {
                    pos.x = 0 + 30;
                }
                if (pos.y < 0 + 30) {
                    pos.y = 0 + 30;
                }
                if (pos.x >= battlefield.width - 30) {
                    pos.x = battlefield.width - 1 - 30;
                }
                if (pos.y >= battlefield.height - 30) {
                    pos.y = battlefield.height - 1 - 30;
                }
            }

            return {
                applyDynamics: function(game, round) {
                    function impact(type, props) {
                        return UnitImpact.impact(type, props, game, round);
                    }
                    GameUtil.eachUnit(game, function(unit) {

                        var unitPhysics = UnitPhysics.getUnitPhysics(unit);

                        unit.velocity = Dynamics.applyAccel(unit.moveAccel, unit.direction, unit.velocity, unitPhysics);

                        if (unit.velocity != null && unit.velocity.value > 0) {

                            if (unitPhysics.needWay) {
                                var positions = [
                                    Dynamics.applyVelocity(unit.velocity, unit.position),
                                    Dynamics.applyVelocity({value: unit.velocity.value, direction: unit.velocity.direction - 3*Math.PI/8}, unit.position),
                                    Dynamics.applyVelocity({value: unit.velocity.value, direction: unit.velocity.direction + 3*Math.PI/8}, unit.position),
                                    Dynamics.applyVelocity({value: unit.velocity.value, direction: unit.velocity.direction -   Math.PI/2}, unit.position),
                                    Dynamics.applyVelocity({value: unit.velocity.value, direction: unit.velocity.direction +   Math.PI/2}, unit.position)
                                ];
                                impact("makeWay", {
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
                        if (unitPhysics.needWay) {
                            limitPosition(unit.position, game.battlefield);
                        }

                        if (unit.state != null) {
                            if (unit.state.name == "fight") {
                                var fightingStyle = UnitFightingStyle.getUnitFightingStyle(unit);
                                if (fightingStyle.createHitImpact && (round - unit.state.since) == fightingStyle.createHitImpact) {
                                    impact("hit", {
                                        position: Vectors.addPos(unit.position, Vectors.vectorPos({
                                            direction: unit.direction,
                                            value: 45
                                        })),
                                        source: unit,
                                        damage: fightingStyle.damage
                                    });
                                } else if (fightingStyle.launchCreateArrow && (round - unit.state.since) == fightingStyle.launchCreateArrow) {
                                    game.nature.push({
                                        type: "arrow",
                                        position: ObjectUtil.clone(unit.position),
                                        start: ObjectUtil.clone(unit.position),
                                        direction: unit.direction,
                                        side: unit.side,
                                        damage: fightingStyle.damage,
                                        moveAccel: 100
                                    });
                                } else if ((round - unit.state.since) == fightingStyle.fightFinish) {
                                    unit.state = null;
                                }
                            } else if (unit.state.name == "die") {
                                if (round - unit.state.since > 2000) {
                                    Cols.remove(unit, unit.side.units);
                                }
                            }
                        }

                        if (unit.type == "arrow") {
                            if (
                                impact("arrow",{
                                    position: unit.position,
                                    side: unit.side,
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
                    });

                }
            };
        })

        .factory("Dynamics", function() {

            function applyAccel(accel, direction, velocity, unitPhysics) {

                if (accel == null || accel == 0) {
                    return null;
                }

                // Add vectors
                var result = Vectors.add({value: accel, direction: direction}, velocity || {value: 0, direction: 0});
                // Speed limit
                var maxSpeed = unitPhysics.maxSpeed;
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