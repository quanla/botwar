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
                                    }
                                }
                            });
                        } else if (type == "makeWay") {
                            var blocking = GameUtil.eachUnit(game, function(unit) {
                                if (unit == props.source) {
                                    return;
                                }
                                var unitPhysics = UnitPhysics.getUnitPhysics(unit);
                                if (unitPhysics.needWay) {
                                    if (Distance.between(unit.position, props.position) < 20) {
                                        return true;
                                    }
                                }
                            });
                            return {
                                then: function(todo) {
                                    if (!blocking) {
                                        todo();
                                    }
                                }
                            };
                        } else if (type == "arrow") {
                            return GameUtil.eachUnit(game, function(unit) {
                                if (unit.state != null && unit.state.name == "die" ) {
                                    return; // Immune to damage
                                }

                                if (types[unit.type].takeHit) {

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
                            var newPosition = Dynamics.applyVelocity(unit.velocity, unit.position);

                            if (unitPhysics.needWay) {
                                impact("makeWay", {
                                    position: newPosition,
                                    source: unit
                                }).then(function() {
                                    unit.position = newPosition;
                                });
                            } else {
                                unit.position = newPosition;
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
                                            value: 30
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